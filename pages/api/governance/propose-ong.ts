// 📝 API ENDPOINT: Proponer nueva ONG
// POST /api/governance/propose-ong

import { NextApiRequest, NextApiResponse } from 'next';
import { governanceContract } from '../../../src/lib/blockchain';
import { PrismaClient } from '../../../src/generated/prisma';
import { validateProposalEligibility, validateONGData } from '../../../src/lib/validations';

const prisma = new PrismaClient();

interface ProposeONGRequest {
  userId: string;
  ongData: {
    name: string;
    description: string;
    mission: string;
    walletAddress: string;
    website?: string;
    category: 'HEALTH' | 'EDUCATION' | 'ENVIRONMENT' | 'CHILDREN' | 'ANIMALS' | 'GENERAL' | 'OTHER';
  };
}

interface ProposeONGResponse {
  success: boolean;
  message: string;
  data?: {
    proposalId: string;
    transactionHash: string;
    blockNumber: number;
    votingEndsAt: Date;
    gasUsed?: number;
    proposalInfo: {
      name: string;
      description: string;
      category: string;
      votingPeriod: string;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProposeONGResponse>
) {
  // ✅ VALIDAR MÉTODO
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is supported'
    });
  }  try {
    // 📝 EXTRAER Y VALIDAR DATOS
    const { userId, ongData }: ProposeONGRequest = req.body;

    if (!userId || !ongData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'userId and ongData are required'      });
    }

    // 🔧 NORMALIZAR USERID (consistente con place-bet.ts)
    const normalizedUserId = userId.toLowerCase();
    console.log('🔧 [API] Normalized userId:', normalizedUserId);

    // 🔍 VALIDAR O CREAR USUARIO
    let user = await prisma.user.findUnique({
      where: { id: normalizedUserId }, // Usar userId normalizado
      select: { 
        id: true, 
        email: true, 
        participations: true 
      }
    });    if (!user) {
      // Crear usuario automáticamente si no existe
      console.log('🆕 Creating new user for governance:', normalizedUserId);
      user = await prisma.user.create({
        data: {
          id: normalizedUserId, // Usar userId normalizado
          participations: 0,
          totalAmountPlayed: '0',
          totalWinnings: '0',
          totalContributed: '0'
        },
        select: { 
          id: true, 
          email: true, 
          participations: true 
        }
      });
      console.log('✅ User created successfully');
    }

    // 🎯 VALIDAR ELEGIBILIDAD PARA PROPONER
    const eligibility = validateProposalEligibility(user.participations);
    if (!eligibility.isValid) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient participations',
        error: eligibility.message
      });
    }    // 🔍 VALIDAR DATOS DE LA ONG
    const ongValidation = validateONGData(ongData);
    if (!ongValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ONG data',
        error: ongValidation.message
      });
    }

    // 🔍 VERIFICAR DUPLICADOS
    const existingONG = await prisma.approvedONG.findFirst({
      where: {
        name: ongData.name
      }
    });

    if (existingONG) {
      return res.status(409).json({
        success: false,
        message: 'ONG already exists',
        error: 'An ONG with this name already exists'
      });
    }

    // 🔍 VERIFICAR PROPUESTA ACTIVA
    const activeProposal = await prisma.oNGProposal.findFirst({
      where: {
        OR: [
          { name: ongData.name },
          { proposedWalletAddress: ongData.walletAddress || '' }
        ],
        status: 'VOTING'
      }
    });

    if (activeProposal) {
      return res.status(409).json({
        success: false,
        message: 'Proposal already exists',
        error: 'There is already an active proposal for this ONG'
      });
    }    // 📝 CREAR PROPUESTA EN EL CONTRATO
    console.log('📝 [API] Creating ONG proposal:', {
      userId: normalizedUserId,
      ongName: ongData.name,
      category: ongData.category,
      userParticipations: user.participations
    });

    const result = await governanceContract.proposeONG(normalizedUserId, ongData);

    console.log('✅ [API] ONG proposal created successfully:', {
      proposalId: result.proposalId,
      transactionHash: result.transactionHash
    });

    // 🎯 RESPUESTA EXITOSA
    return res.status(201).json({
      success: true,
      message: 'ONG proposal created successfully',
      data: {
        proposalId: result.proposalId,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        votingEndsAt: result.votingEndsAt,
        gasUsed: result.gasUsed,
        proposalInfo: {
          name: ongData.name,
          description: ongData.description,
          category: ongData.category,
          votingPeriod: '7 days'
        }
      }
    });

  } catch (error) {
    console.error('❌ [API] Error creating ONG proposal:', error);

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

      // Error de datos duplicados
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return res.status(409).json({
          success: false,
          message: 'Duplicate data',
          error: error.message
        });
      }

      // Error de validación
      if (error.message.includes('invalid') || error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
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
        message: 'Failed to create proposal',
        error: error.message
      });
    }

    // Error completamente desconocido
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred while creating the proposal'
    });
  }
}