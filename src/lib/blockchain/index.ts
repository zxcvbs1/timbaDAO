// 🏭 FUNCIONALIDAD: Factory principal del sistema blockchain
// Decide entre usar contratos reales o mocks según la configuración

import { defaultBlockchainConfig } from './config';
import { MockLotteryContract } from './mock-lottery';
import { MockGovernanceContract } from './mock-governance';
import type { ILotteryContract, IONGGovernanceContract } from './interfaces';

// 🔧 FACTORY PARA CONTRATOS DE LOTERÍA
export function createLotteryContract(): ILotteryContract {
  if (defaultBlockchainConfig.useRealContracts) {
    // TODO: Implementar contrato real cuando esté listo
    console.log('🔗 [BLOCKCHAIN] Using real lottery contract (not implemented yet)');
    throw new Error('Real contracts not implemented yet. Set USE_BLOCKCHAIN=false for development.');
  } else {
    console.log('🎭 [MOCK] Using mock lottery contract for development');
    return new MockLotteryContract();
  }
}

// 🔧 FACTORY PARA CONTRATOS DE GOVERNANZA
export function createGovernanceContract(): IONGGovernanceContract {
  if (defaultBlockchainConfig.useRealContracts) {
    // TODO: Implementar contrato real cuando esté listo
    console.log('🔗 [BLOCKCHAIN] Using real governance contract (not implemented yet)');
    throw new Error('Real contracts not implemented yet. Set USE_BLOCKCHAIN=false for development.');
  } else {
    console.log('🎭 [MOCK] Using mock governance contract for development');
    return new MockGovernanceContract();
  }
}

// 🎯 INSTANCIAS SINGLETON PARA USO EN LA APP
export const lotteryContract = createLotteryContract();
export const governanceContract = createGovernanceContract();

// 🔍 UTILITIES PARA DEBUGGING Y TESTING
export function getContractInfo() {
  return {
    mode: defaultBlockchainConfig.useRealContracts ? 'REAL' : 'MOCK',
    network: defaultBlockchainConfig.network,
    lotteryAddress: defaultBlockchainConfig.contracts.lottery,
    governanceAddress: defaultBlockchainConfig.contracts.governance,
    rpcUrl: defaultBlockchainConfig.rpcUrl
  };
}

export function isUsingMockContracts(): boolean {
  return !defaultBlockchainConfig.useRealContracts;
}

export function validateConfiguration(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (defaultBlockchainConfig.useRealContracts) {
    if (!defaultBlockchainConfig.contracts.lottery) {
      errors.push('LOTTERY_CONTRACT_ADDRESS environment variable is required for real contracts');
    }
    
    if (!defaultBlockchainConfig.contracts.governance) {
      errors.push('GOVERNANCE_CONTRACT_ADDRESS environment variable is required for real contracts');
    }
    
    if (!defaultBlockchainConfig.rpcUrl) {
      errors.push('MANTLE_RPC_URL environment variable is required for real contracts');
    }
  }

  // Validar configuración del juego
  if (defaultBlockchainConfig.numbersCount <= 0) {
    errors.push('numbersCount must be greater than 0');
  }

  if (defaultBlockchainConfig.numbersRange <= 0) {
    errors.push('numbersRange must be greater than 0');
  }

  if (defaultBlockchainConfig.numbersCount > defaultBlockchainConfig.numbersRange) {
    errors.push('numbersCount cannot be greater than numbersRange');
  }

  // Validar distribución de fondos
  const totalPercentage = defaultBlockchainConfig.ongPercentage + 
                         defaultBlockchainConfig.ownerPercentage + 
                         defaultBlockchainConfig.poolPercentage;
  
  if (totalPercentage !== 100) {
    errors.push(`Fund distribution must total 100%, currently ${totalPercentage}%`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 🔄 FUNCIONES DE INICIALIZACIÓN
export async function initializeSystem(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚀 [SYSTEM] Initializing blockchain system...');
    
    // Validar configuración
    const config = validateConfiguration();
    if (!config.isValid) {
      return {
        success: false,
        message: `Configuration errors: ${config.errors.join(', ')}`
      };
    }

    // Log de información del sistema
    const info = getContractInfo();
    console.log('📊 [SYSTEM] Contract configuration:', info);

    console.log('✅ [SYSTEM] Blockchain system initialized successfully');
    return {
      success: true,
      message: `System initialized in ${info.mode} mode`
    };
    
  } catch (error) {
    console.error('❌ [SYSTEM] Failed to initialize blockchain system:', error);
    return {
      success: false,
      message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// 🧪 FUNCIONES PARA TESTING
export function resetMockContracts(): void {
  if (defaultBlockchainConfig.useRealContracts) {
    throw new Error('Cannot reset real contracts');
  }
  
  console.log('🔄 [MOCK] Resetting mock contracts...');
  // Los mocks ya manejan el estado a través de Prisma, no necesitan reset especial
  console.log('✅ [MOCK] Mock contracts reset completed');
}

export function getMockStats() {
  if (defaultBlockchainConfig.useRealContracts) {
    throw new Error('Mock stats only available in mock mode');
  }
  
  return {
    mode: 'MOCK',
    contractsCreated: true,
    database: 'Prisma + Neon PostgreSQL',
    features: [
      'Lottery betting system',
      'ONG proposal system', 
      'Voting with participation weights',
      'Automated draw system',
      'Financial tracking in wei'
    ]
  };
}