// ⚙️ FUNCIONALIDAD: Configuración centralizada del sistema
// Define parámetros de juego, participaciones mínimas, y configuración blockchain

export const MANTLE_NETWORK = {
  name: 'Mantle',
  chainId: 5000,
  symbol: 'MNT',
  rpcUrl: 'https://rpc.mantle.xyz',
  explorerUrl: 'https://explorer.mantle.xyz'
};

export const MANTLE_TESTNET = {
  name: 'Mantle Testnet',
  chainId: 5001,
  symbol: 'MNT',
  rpcUrl: 'https://rpc.testnet.mantle.xyz',
  explorerUrl: 'https://explorer.testnet.mantle.xyz'
};

export const GAME_CONFIG = {
  // 🎮 PARÁMETROS DEL JUEGO - NUEVO SISTEMA ÚNICO
  numbersCount: 1,              // 1 número único por jugada (0-99)
  numbersRange: 99,             // Números del 0 al 99
  totalSlots: 100,              // 100 números únicos disponibles por ronda
  minMatchesToWin: 1,           // Ganar con número exacto únicamente
  defaultBetAmount: '1000000000000000000', // 1 MNT en wei
    // 🎯 NUEVAS REGLAS DE PARTICIPACIÓN
  minimumParticipants: 0,       // Sin mínimo de jugadores para hacer sorteo
  optimalParticipants: 50,      // Óptimo: 50% de slots ocupados
  maximumWaitTime: 24 * 60 * 60 * 1000, // 24 horas máximo de espera
  
  // 💰 DISTRIBUCIÓN DE FONDOS (Actualizada para mayor prize pool)
  ongPercentage: 15,            // 15% para ONG
  ownerPercentage: 5,           // 5% para owner
  poolPercentage: 80,           // 80% para el ganador único  // 🕐 TIMING
  drawInterval: 86400,          // 24 horas en segundos
  minPlayersForDraw: 0, // Sin mínimo de jugadores - SIEMPRE PERMITIR SORTEO
  
  // 🎯 PARTICIPACIONES MÍNIMAS (CLAVE DEL SISTEMA)
  participations: {
    minToVote: 3,               // Mínimo 3 juegos para votar
    minToPropose: 10,           // Mínimo 10 juegos para proponer ONG
    voteWeightBase: 1,          // Peso base del voto
    voteWeightBonus: 0.1,       // Bonus por participación adicional
    maxVoteWeight: 5            // Peso máximo del voto
  },
  
  // 🗳️ PARÁMETROS DE VOTACIÓN
  voting: {
    duration: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
    approvalThreshold: 60,       // 60% para aprobar
    minimumVotes: 5,             // Mínimo 5 votos totales
    quorumPercentage: 10,        // 10% de usuarios activos deben votar
    autoFinalizeThreshold: 20    // Auto-finalizar con 20 votos
  },

  // 🏛️ PARÁMETROS DE GOVERNANZA
  governance: {
    votingPeriodDays: 7,
    minVotesForApproval: 5,
    approvalThreshold: 60,
    autoFinalizeThreshold: 20
  }
};

export const defaultBlockchainConfig = {
  // 🔧 CONFIGURACIÓN PRINCIPAL
  useRealContracts: process.env.USE_BLOCKCHAIN === 'true',
  network: (process.env.BLOCKCHAIN_NETWORK as any) || 'local',
  
  // 📜 DIRECCIONES DE CONTRATOS
  contracts: {
    lottery: process.env.LOTTERY_CONTRACT_ADDRESS,
    governance: process.env.GOVERNANCE_CONTRACT_ADDRESS
  },
  
  // 🌐 RPC
  rpcUrl: process.env.MANTLE_RPC_URL || MANTLE_NETWORK.rpcUrl,
  
  // Configuración del juego
  ...GAME_CONFIG
};

export type BlockchainConfig = typeof defaultBlockchainConfig;

// 🔍 HELPERS PARA VALIDACIONES
export const calculateVoteWeight = (participations: number): number => {
  const base = GAME_CONFIG.participations.voteWeightBase;
  const bonus = GAME_CONFIG.participations.voteWeightBonus;
  const max = GAME_CONFIG.participations.maxVoteWeight;
  
  const weight = base + (participations * bonus);
  return Math.min(weight, max);
};

export const canUserPropose = (participations: number): boolean => {
  return participations >= GAME_CONFIG.participations.minToPropose;
};

export const canUserVote = (participations: number): boolean => {
  return participations >= GAME_CONFIG.participations.minToVote;
};