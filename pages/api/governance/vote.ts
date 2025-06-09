// 🗳️ API ENDPOINT: Votar en propuesta de ONG
// POST /api/governance/vote

import { NextApiRequest, NextApiResponse } from 'next';
import { governanceContract } from '../../../src/lib/blockchain';
import { PrismaClient } from '../../../src/generated/prisma';
import { validateVotingEligibility } from '../../../src/lib/validations';

const prisma = new PrismaClient();

interface VoteRequest {
  userId: string;
  proposalId: string;
  support: boolean; // true = a favor, false = en contra
}

interface VoteResponse {
  success: boolean;
  message: string;
  data?: {
    transactionHash: string;
    blockNumber: number;
    voteWeight: number;
    proposalStatus: 'VOTING' | 'APPROVED' | 'REJECTED';
    gasUsed?: number;
    voteInfo: {
      support: boolean;
      voteWeight: number;
      totalVotesFor: number;
      totalVotesAgainst: number;
      votingEndsAt: Date;
      userParticipations: number;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VoteResponse>
) {
  // ✅ VALIDAR MÉTODO
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is supported'
    });
  }

  try {
    // 📝 EXTRAER Y VALIDAR DATOS
    const { userId, proposalId, support }: VoteRequest = req.body;

    if (!userId || !proposalId || typeof support !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'userId, proposalId, and support (boolean) are required'
      });
    }

    // 🔍 VALIDAR USUARIO Y PARTICIPACIONES
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        participations: true 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: `User with id ${userId} does not exist`
      });
    }

    // 🎯 VALIDAR ELEGIBILIDAD PARA VOTAR
    const eligibility = validateVotingEligibility(user.participations);
    if (!eligibility.isValid) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient participations',
        error: eligibility.message
      });
    }

    // 🔍 VALIDAR PROPUESTA
    const proposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
        error: `Proposal with id ${proposalId} does not exist`
      });
    }

    if (proposal.status !== 'VOTING') {
      return res.status(400).json({
        success: false,
        message: 'Proposal not active',
        error: 'This proposal is no longer accepting votes'
      });
    }

    if (proposal.votingEndsAt && proposal.votingEndsAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Voting period ended',
        error: 'The voting period for this proposal has ended'
      });
    }

    // 🔍 VERIFICAR SI YA VOTÓ
    const existingVote = await prisma.vote.findFirst({
      where: { 
        userId, 
        proposalId 
      }
    });

    if (existingVote) {
      return res.status(409).json({
        success: false,
        message: 'Already voted',
        error: 'You have already voted on this proposal'
      });
    }

    // 🗳️ EJECUTAR VOTO EN EL CONTRATO
    console.log('🗳️ [API] Processing vote:', {
      userId,
      proposalId,
      support: support ? 'FOR' : 'AGAINST',
      userParticipations: user.participations,
      voteWeight: user.participations
    });

    const result = await governanceContract.vote(userId, proposalId, support);

    // 📊 OBTENER INFORMACIÓN ACTUALIZADA DE LA PROPUESTA
    const updatedProposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId },
      select: {
        votesFor: true,
        votesAgainst: true,
        votingEndsAt: true,
        status: true
      }
    });

    console.log('✅ [API] Vote registered successfully:', {
      transactionHash: result.transactionHash,
      voteWeight: result.voteWeight,
      proposalStatus: result.proposalStatus
    });

    // 🎯 RESPUESTA EXITOSA
    return res.status(200).json({
      success: true,
      message: 'Vote registered successfully',
      data: {
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        voteWeight: result.voteWeight,
        proposalStatus: result.proposalStatus,
        gasUsed: result.gasUsed,
        voteInfo: {
          support,
          voteWeight: result.voteWeight,
          totalVotesFor: updatedProposal?.votesFor || 0,
          totalVotesAgainst: updatedProposal?.votesAgainst || 0,
          votingEndsAt: updatedProposal?.votingEndsAt || new Date(),
          userParticipations: user.participations
        }
      }
    });

  } catch (error) {
    console.error('❌ [API] Error processing vote:', error);

    // Manejar errores específicos
    if (error instanceof Error) {
      // Error de participaciones insuficientes
      if (error.message.includes('participaciones') || error.message.includes('participations')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient participations',
          error: error.message
        });
      }

      // Error de propuesta no encontrada
      if (error.message.includes('not found') || error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Proposal not found',
          error: error.message
        });
      }

      // Error de votación duplicada
      if (error.message.includes('ya has votado') || error.message.includes('already voted')) {
        return res.status(409).json({
          success: false,
          message: 'Already voted',
          error: error.message
        });
      }

      // Error de propuesta inactiva o expirada
      if (error.message.includes('activa') || error.message.includes('terminado') || error.message.includes('ended')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid proposal state',
          error: error.message
        });
      }

      // Error de contrato/blockchain
      if (error.message.includes('transaction') || error.message.includes('gas')) {
        return res.status(500).json({
          success: false,
          message: 'Blockchain transaction failed',
          error: error.message
        });
      }

      // Error genérico del contrato
      return res.status(500).json({
        success: false,
        message: 'Failed to process vote',
        error: error.message
      });
    }

    // Error completamente desconocido
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred while processing the vote'
    });
  }
}