// 🎯 FUNCIONALIDAD: Define el "contrato" entre frontend y blockchain
// Establece exactamente qué funciones tendrán los smart contracts

// ===== TIPOS DE RESPUESTA =====
export interface GameResult {
  gameId: string;
  transactionHash: string;
  blockNumber: number;
  success: boolean;
  gasUsed?: number;
  contributionAmount: string; // Lo que va a la ONG
  poolContribution: string;   // Lo que va al pool
}

export interface DrawResult {
  winningNumbers: number[];
  winners: Winner[];
  transactionHash: string;
  totalPrizePool: string;
  drawId: string;
  distributionTx?: string; // TX de distribución de premios
  totalTickets?: number; // Número total de tickets en el sorteo
}

export interface Winner {
  userId: string;
  gameId: string;
  prizeAmount: string;
  matchedNumbers: number;
  walletAddress?: string;
  // Propiedades adicionales para eventos en tiempo real
  ticketId: string;
  numbers: number[];
  player: string; // Alias para userId/walletAddress
}

export interface ProposalResult {
  proposalId: string;
  transactionHash: string;
  blockNumber: number;
  success: boolean;
  gasUsed?: number;
  votingEndsAt: Date;
}

export interface VoteResult {
  transactionHash: string;
  blockNumber: number;
  success: boolean;
  gasUsed?: number;
  voteWeight: number;
  proposalStatus: 'VOTING' | 'APPROVED' | 'REJECTED';
}

// ===== INTERFACE PRINCIPAL DEL CONTRATO DE LOTERÍA =====
export interface ILotteryContract {  // 🎰 FUNCIONES DE JUEGO
  placeBet(
    userId: string,
    selectedNumbers: number[], // [42] - Solo un número en el rango 0-99
    selectedOngId: string,     // "unicef"
    betAmount: string          // "1000000000000000000" (1 MNT en wei)
  ): Promise<GameResult>;

  // 🎲 SORTEO DE NÚMEROS (automatizado o manual)
  drawNumbers(force?: boolean): Promise<DrawResult>;
  
  // 🔧 FUNCIONES DE ADMINISTRACIÓN
  setMinPlayersForDraw(count: number): Promise<void>;
  triggerDraw(specificNumbers?: number[]): Promise<DrawResult>; // Para testing
  
  // 📊 CONSULTAS DEL ESTADO
  getCurrentPool(): Promise<string>;
  getONGFunds(ongId: string): Promise<string>;
  getUserWinnings(userId: string): Promise<string>;
  getGameById(gameId: string): Promise<any>;
  getDrawHistory(limit?: number): Promise<DrawResult[]>;
  getUserStats(userId: string): Promise<{
    totalPlayed: string;
    totalWon: string;
    totalContributed: string;
    gamesPlayed: number;
    gamesWon: number;
  }>;
}

// ===== INTERFACE DEL CONTRATO DE GOVERNANZA =====
export interface IONGGovernanceContract {  // 📝 PROPUESTAS DE ONGs (requiere participaciones mínimas)
  proposeONG(
    userId: string,
    ongData: {
      name: string;
      description: string;
      mission: string;
      walletAddress: string;
      website?: string;
      category: string;
    }
  ): Promise<ProposalResult>;

  // 🗳️ SISTEMA DE VOTACIÓN (requiere participaciones mínimas)
  vote(
    userId: string,
    proposalId: string,
    support: boolean
  ): Promise<VoteResult>;

  // 📊 CONSULTAS DE INFORMACIÓN
  getProposal(proposalId: string): Promise<ProposalInfo | null>;
  getActiveProposals(): Promise<ProposalInfo[]>;
  getUserVote(userId: string, proposalId: string): Promise<any>;
  getProposalHistory(limit?: number): Promise<ProposalInfo[]>;
  
  // 🔄 MÉTODOS DE ADMINISTRACIÓN
  processExpiredProposals(): Promise<void>;
  finalizeProposal(proposalId: string): Promise<void>;

  // ⚖️ MÉTODOS LEGACY (para compatibilidad)
  executeProposal(proposalId: string): Promise<{
    approved: boolean;
    ongId?: string;
    transactionHash: string;
    newOngWallet?: string;
  }>;

  getProposalStatus(proposalId: string): Promise<{
    status: 'VOTING' | 'APPROVED' | 'REJECTED';
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    proposalData: any;
  }>;

  getApprovedONGs(): Promise<any[]>;
  getUserVotingPower(userId: string): Promise<number>;

  // ⚖️ EJECUCIÓN DE PROPUESTAS
  executeProposal(proposalId: string): Promise<{
    approved: boolean;
    ongId?: string;
    transactionHash: string;
    newOngWallet?: string;
  }>;

  // 📊 CONSULTAS DE ESTADO
  getProposalStatus(proposalId: string): Promise<{
    status: 'VOTING' | 'APPROVED' | 'REJECTED';
    votesFor: number;
    votesAgainst: number;
    deadline: number;
    proposalData: any;
  }>;

  getApprovedONGs(): Promise<any[]>;
  getUserVotingPower(userId: string): Promise<number>;
  getActiveProposals(): Promise<any[]>;
  
  // 🔍 VALIDACIONES DE PARTICIPACIÓN
  canUserPropose(userId: string): Promise<{
    canPropose: boolean;
    currentParticipations: number;
    requiredParticipations: number;
    message: string;
  }>;

  canUserVote(userId: string): Promise<{
    canVote: boolean;
    currentParticipations: number;
    requiredParticipations: number;
    voteWeight: number;
    message: string;
  }>;
}

// ===== TIPOS ADICIONALES PARA GOVERNANCE =====
export interface ProposalInfo {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  website?: string;
  category: string;
  proposedBy: string;
  proposer: {
    id: string;
    email: string;
    participations: number;
  };
  votesFor: number;
  votesAgainst: number;
  totalVoteWeight: number;
  isActive: boolean;
  status: 'VOTING' | 'APPROVED' | 'REJECTED';
  proposedAt: Date;
  votingEndsAt: Date;
  decidedAt?: Date;
  votes: Array<{
    id: string;
    userId: string;
    support: boolean;
    voteWeight: number;
    votedAt: Date;
    user: {
      id: string;
      email: string;
      participations: number;
    };
  }>;
  transactionHash: string;
  blockNumber: number;
}

// ===== EVENTOS DEL SISTEMA =====
export interface GameEvents {
  BetPlaced: {
    userId: string;
    gameId: string;
    amount: string;
    ongId: string;
    contributionAmount: string;
  };
  NumbersDrawn: {
    drawId: string;
    winningNumbers: number[];
    winnersCount: number;
    totalPrizePool: string;
  };
  PrizeDistributed: {
    winner: string;
    amount: string;
    gameId: string;
  };
}

export interface GovernanceEvents {
  ProposalCreated: {
    proposalId: string;
    proposer: string;
    ongName: string;
    proposerParticipations: number;
  };
  VoteCast: {
    proposalId: string;
    voter: string;
    vote: boolean;
    weight: number;
    voterParticipations: number;
  };
  ProposalExecuted: {
    proposalId: string;
    approved: boolean;
    newOngId?: string;
  };
}