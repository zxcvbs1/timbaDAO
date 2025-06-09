// 🏛️ FUNCIONALIDAD: Simula el contrato de governanza de ONGs
// Maneja propuestas, votaciones y aprobación de nuevas ONGs

import { prisma } from '../prisma';
import { defaultBlockchainConfig } from './config';
import { validateVotingEligibility, validateProposalEligibility } from '../validations';
import type { 
  IONGGovernanceContract, 
  ProposalResult, 
  VoteResult,
  ProposalInfo 
} from './interfaces';

export class MockGovernanceContract implements IONGGovernanceContract {
  private config = defaultBlockchainConfig;

  // 📝 PROPONER NUEVA ONG
  async proposeONG(
    userId: string,
    ongData: {
      name: string;
      description: string;
      walletAddress: string;
      website?: string;
      category: string;
    }
  ): Promise<ProposalResult> {
    console.log('📝 [MOCK] Proposing new ONG:', {
      userId,
      ongName: ongData.name,
      category: ongData.category
    });

    try {
      // 🔍 VALIDAR ELEGIBILIDAD PARA PROPONER
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { participations: true }
      });

      const eligibility = validateProposalEligibility(user?.participations || 0);
      if (!eligibility.isValid) {
        throw new Error(eligibility.message);
      }

      // 🔍 VALIDAR DATOS DE LA ONG
      await this.validateONGData(ongData);

      // 🎯 GENERAR DATOS MOCK
      const mockTxHash = this.generateMockTxHash();
      const mockBlockNumber = this.generateMockBlockNumber();

      // 📝 CREAR PROPUESTA
      const proposal = await prisma.oNGProposal.create({
        data: {
          proposedById: userId,
          name: ongData.name,
          description: ongData.description,
          proposedWalletAddress: ongData.walletAddress,
          website: ongData.website,
          category: ongData.category as any, // Enum será validado por Prisma
          votesFor: 0,
          votesAgainst: 0,
          status: 'VOTING',
          votingEndsAt: new Date(Date.now() + this.config.governance.votingPeriodDays * 24 * 60 * 60 * 1000)
        }
      });

      console.log('✅ [MOCK] ONG proposal created successfully');

      return {
        proposalId: proposal.id,
        transactionHash: mockTxHash,
        blockNumber: mockBlockNumber,
        success: true,
        gasUsed: Math.floor(Math.random() * 80000) + 40000,
        votingEndsAt: proposal.votingEndsAt
      };

    } catch (error) {
      console.error('❌ [MOCK] Error creating proposal:', error);
      throw error;
    }
  }

  // 🗳️ VOTAR EN PROPUESTA
  async vote(
    userId: string,
    proposalId: string,
    support: boolean
  ): Promise<VoteResult> {
    console.log('🗳️ [MOCK] Voting on proposal:', {
      userId,
      proposalId,
      support: support ? 'FOR' : 'AGAINST'
    });

    try {
      // 🔍 VALIDAR ELEGIBILIDAD PARA VOTAR
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { participations: true }
      });

      const eligibility = validateVotingEligibility(user?.participations || 0);
      if (!eligibility.isValid) {
        throw new Error(eligibility.message);
      }

      // 🔍 VALIDAR PROPUESTA
      const proposal = await this.validateProposalForVoting(proposalId, userId);

      // 🎯 CALCULAR PESO DEL VOTO
      const voteWeight = user?.participations || 0;

      // 🎯 GENERAR DATOS MOCK
      const mockTxHash = this.generateMockTxHash();
      const mockBlockNumber = this.generateMockBlockNumber();

      // 🗳️ REGISTRAR VOTO
      const vote = await prisma.vote.create({
        data: {
          userId,
          proposalId,
          vote: support
        }
      });

      // 📊 ACTUALIZAR CONTADORES DE LA PROPUESTA
      await this.updateProposalVoteCounts(proposalId, support, voteWeight);

      // 🎯 VERIFICAR SI SE PUEDE FINALIZAR LA PROPUESTA
      const updatedProposal = await this.checkProposalCompletion(proposalId);

      console.log('✅ [MOCK] Vote registered successfully');

      return {
        transactionHash: mockTxHash,
        blockNumber: mockBlockNumber,
        success: true,
        gasUsed: Math.floor(Math.random() * 60000) + 30000,
        voteWeight,
        proposalStatus: updatedProposal.status
      };

    } catch (error) {
      console.error('❌ [MOCK] Error voting:', error);
      throw error;
    }
  }

  // 📊 GETTERS DE INFORMACIÓN
  async getProposal(proposalId: string): Promise<ProposalInfo | null> {
    const proposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId },
      include: {
        votes: {
          include: {
            user: { select: { id: true, email: true, participations: true } }
          }
        },
        proposedBy: { select: { id: true, email: true, participations: true } }
      }
    });

    if (!proposal) return null;

    return {
      id: proposal.id,
      name: proposal.name,
      description: proposal.description,
      walletAddress: proposal.proposedWalletAddress,
      website: proposal.website,
      category: proposal.category,
      proposedBy: proposal.proposedById,
      proposer: proposal.proposedBy,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      status: proposal.status,
      proposedAt: proposal.createdAt,
      votingEndsAt: proposal.votingEndsAt,
      votes: proposal.votes
    };
  }

  async getActiveProposals(): Promise<ProposalInfo[]> {
    const proposals = await prisma.oNGProposal.findMany({
      where: {
        status: 'VOTING',
        votingEndsAt: { gt: new Date() }
      },
      include: {
        proposedBy: { select: { id: true, email: true, participations: true } },
        votes: {
          include: {
            user: { select: { id: true, email: true, participations: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return proposals.map((proposal: any) => ({
      id: proposal.id,
      name: proposal.name,
      description: proposal.description,
      walletAddress: proposal.proposedWalletAddress,
      website: proposal.website,
      category: proposal.category,
      proposedBy: proposal.proposedById,
      proposer: proposal.proposedBy,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      status: proposal.status,
      proposedAt: proposal.createdAt,
      votingEndsAt: proposal.votingEndsAt,
      votes: proposal.votes
    }));
  }

  async getUserVote(userId: string, proposalId: string): Promise<any> {
    return await prisma.vote.findFirst({
      where: { userId, proposalId }
    });
  }

  async getProposalHistory(limit: number = 20): Promise<ProposalInfo[]> {
    const proposals = await prisma.oNGProposal.findMany({
      include: {
        proposedBy: { select: { id: true, email: true, participations: true } },
        votes: {
          include: {
            user: { select: { id: true, email: true, participations: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return proposals.map((proposal: any) => ({
      id: proposal.id,
      name: proposal.name,
      description: proposal.description,
      walletAddress: proposal.proposedWalletAddress,
      website: proposal.website,
      category: proposal.category,
      proposedBy: proposal.proposedById,
      proposer: proposal.proposedBy,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      status: proposal.status,
      proposedAt: proposal.createdAt,
      votingEndsAt: proposal.votingEndsAt,
      votes: proposal.votes
    }));
  }

  // 🔄 MÉTODOS DE ADMINISTRACIÓN
  async processExpiredProposals(): Promise<void> {
    console.log('🔄 [MOCK] Processing expired proposals...');

    const expiredProposals = await prisma.oNGProposal.findMany({
      where: {
        status: 'VOTING',
        votingEndsAt: { lt: new Date() }
      }
    });

    for (const proposal of expiredProposals) {
      await this.finalizeProposal(proposal.id);
    }

    console.log(`✅ [MOCK] Processed ${expiredProposals.length} expired proposals`);
  }

  async finalizeProposal(proposalId: string): Promise<void> {
    const proposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // 🎯 DETERMINAR RESULTADO
    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    const requiredVotes = this.config.governance.minVotesForApproval;
    const approvalThreshold = this.config.governance.approvalThreshold;

    let newStatus: 'APPROVED' | 'REJECTED';
    
    if (totalVotes < requiredVotes) {
      newStatus = 'REJECTED';
    } else {
      const approvalPercentage = (proposal.votesFor / totalVotes) * 100;
      newStatus = approvalPercentage >= approvalThreshold ? 'APPROVED' : 'REJECTED';
    }

    // 📝 ACTUALIZAR PROPUESTA
    await prisma.oNGProposal.update({
      where: { id: proposalId },
      data: {
        status: newStatus,
        isActive: false,
        decidedAt: new Date()
      }
    });

    // 🎯 SI FUE APROBADA, CREAR ONG
    if (newStatus === 'APPROVED') {
      await prisma.approvedONG.create({
        data: {
          name: proposal.name,
          description: proposal.description,
          walletAddress: proposal.walletAddress,
          website: proposal.website,
          category: proposal.category,
          isActive: true,
          approvedAt: new Date(),
          totalGamesSupporting: 0,
          totalFundsReceived: '0'
        }
      });

      console.log(`✅ [MOCK] ONG "${proposal.name}" approved and created`);
    } else {
      console.log(`❌ [MOCK] ONG "${proposal.name}" rejected`);
    }
  }

  // ⚖️ MÉTODOS LEGACY (para compatibilidad con interfaz original)
  async executeProposal(proposalId: string): Promise<{
    approved: boolean;
    ongId?: string;
    transactionHash: string;
    newOngWallet?: string;
  }> {
    console.log('⚖️ [MOCK] Executing proposal (legacy method):', proposalId);
    
    const proposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    await this.finalizeProposal(proposalId);
    
    const updatedProposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId }
    });

    return {
      approved: updatedProposal?.status === 'APPROVED',
      ongId: updatedProposal?.status === 'APPROVED' ? proposalId : undefined,
      transactionHash: this.generateMockTxHash(),
      newOngWallet: updatedProposal?.status === 'APPROVED' ? updatedProposal.walletAddress : undefined
    };
  }

  async getProposalStatus(proposalId: string): Promise<{
    status: 'VOTING' | 'APPROVED' | 'REJECTED';
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    proposalData: any;
  }> {
    const proposal = await this.getProposal(proposalId);
    
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    return {
      status: proposal.status,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      deadline: proposal.votingEndsAt.getTime(),
      proposalData: {
        name: proposal.name,
        description: proposal.description,
        walletAddress: proposal.walletAddress,
        website: proposal.website,
        category: proposal.category
      }
    };
  }

  async getApprovedONGs(): Promise<any[]> {
    const ongs = await prisma.approvedONG.findMany({
      where: { isActive: true },
      orderBy: { approvedAt: 'desc' }
    });

    return ongs;
  }

  async getUserVotingPower(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { participations: true }
    });

    return user?.participations || 0;
  }

  // 🔍 VALIDACIONES DE PARTICIPACIÓN
  async canUserPropose(userId: string): Promise<{
    canPropose: boolean;
    currentParticipations: number;
    requiredParticipations: number;
    message: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { participations: true }
    });

    const participations = user?.participations || 0;
    const required = this.config.participations.minToPropose;
    const canPropose = participations >= required;

    return {
      canPropose,
      currentParticipations: participations,
      requiredParticipations: required,
      message: canPropose 
        ? 'Puedes proponer nuevas ONGs'
        : `Necesitas ${required} participaciones para proponer. Tienes ${participations}.`
    };
  }

  async canUserVote(userId: string): Promise<{
    canVote: boolean;
    currentParticipations: number;
    requiredParticipations: number;
    voteWeight: number;
    message: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { participations: true }
    });

    const participations = user?.participations || 0;
    const required = this.config.participations.minToVote;
    const canVote = participations >= required;
    const voteWeight = participations; // Peso = participaciones

    return {
      canVote,
      currentParticipations: participations,
      requiredParticipations: required,
      voteWeight,
      message: canVote 
        ? `Puedes votar con peso ${voteWeight}`
        : `Necesitas ${required} participaciones para votar. Tienes ${participations}.`
    };
  }

  // ===== MÉTODOS PRIVADOS =====

  private async validateONGData(ongData: any) {
    // Validar nombre único
    const existingONG = await prisma.approvedONG.findFirst({
      where: { name: ongData.name }
    });

    if (existingONG) {
      throw new Error('Ya existe una ONG con ese nombre');
    }

    // Validar wallet address único
    const existingWallet = await prisma.approvedONG.findFirst({
      where: { walletAddress: ongData.walletAddress }
    });

    if (existingWallet) {
      throw new Error('Ya existe una ONG con esa wallet address');
    }

    // Validar propuesta activa
    const existingProposal = await prisma.oNGProposal.findFirst({
      where: {
        OR: [
          { name: ongData.name },
          { walletAddress: ongData.walletAddress }
        ],
        isActive: true
      }
    });

    if (existingProposal) {
      throw new Error('Ya existe una propuesta activa para esta ONG');
    }
  }

  private async validateProposalForVoting(proposalId: string, userId: string) {
    const proposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new Error('Propuesta no encontrada');
    }

    if (!proposal.isActive) {
      throw new Error('La propuesta no está activa');
    }

    if (proposal.votingEndsAt < new Date()) {
      throw new Error('El período de votación ha terminado');
    }

    // Verificar si ya votó
    const existingVote = await prisma.vote.findFirst({
      where: { userId, proposalId }
    });

    if (existingVote) {
      throw new Error('Ya has votado en esta propuesta');
    }

    return proposal;
  }

  private async updateProposalVoteCounts(
    proposalId: string, 
    support: boolean, 
    voteWeight: number
  ) {
    if (support) {
      await prisma.oNGProposal.update({
        where: { id: proposalId },
        data: {
          votesFor: { increment: 1 }
        }
      });
    } else {
      await prisma.oNGProposal.update({
        where: { id: proposalId },
        data: {
          votesAgainst: { increment: 1 }
        }
      });
    }
  }

  private async checkProposalCompletion(proposalId: string) {
    const proposal = await prisma.oNGProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) throw new Error('Proposal not found');

    // Auto-finalizar si se alcanzó el threshold de votos
    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    if (totalVotes >= this.config.governance.autoFinalizeThreshold) {
      await this.finalizeProposal(proposalId);
      return { ...proposal, status: 'FINALIZED' as any };
    }

    return proposal;
  }

  private generateMockTxHash(): string {
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private generateMockBlockNumber(): number {
    return Math.floor(Math.random() * 1000000) + 1000000;
  }
}