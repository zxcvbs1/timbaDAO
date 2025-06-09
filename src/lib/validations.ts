// 🔍 FUNCIONALIDAD: Validaciones centralizadas del sistema
// Valida participaciones mínimas, números de lotería y datos de ONGs

import { defaultBlockchainConfig } from './blockchain/config';

// 📊 TIPOS DE VALIDACIÓN
export interface ValidationResult {
  isValid: boolean;
  message: string;
  requiredAmount?: number;
  currentAmount?: number;
}

// 🗳️ VALIDACIÓN PARA VOTAR EN PROPUESTAS
export function validateVotingEligibility(participations: number): ValidationResult {
  const minRequired = defaultBlockchainConfig.participations.minToVote;
  
  if (participations >= minRequired) {
    return {
      isValid: true,
      message: 'Elegible para votar',
      currentAmount: participations,
      requiredAmount: minRequired
    };
  }

  return {
    isValid: false,
    message: `Necesitas al menos ${minRequired} participaciones para votar. Tienes ${participations}.`,
    currentAmount: participations,
    requiredAmount: minRequired
  };
}

// 📝 VALIDACIÓN PARA PROPONER ONGs
export function validateProposalEligibility(participations: number): ValidationResult {
  const minRequired = defaultBlockchainConfig.participations.minToPropose;
  
  if (participations >= minRequired) {
    return {
      isValid: true,
      message: 'Elegible para proponer ONGs',
      currentAmount: participations,
      requiredAmount: minRequired
    };
  }

  return {
    isValid: false,
    message: `Necesitas al menos ${minRequired} participaciones para proponer una ONG. Tienes ${participations}.`,
    currentAmount: participations,
    requiredAmount: minRequired
  };
}

// 🎯 VALIDACIÓN DE NÚMEROS DE LOTERÍA
export function validateLotteryNumbers(numbers: number[]): ValidationResult {
  const config = defaultBlockchainConfig;
  
  // Verificar cantidad de números
  if (numbers.length !== config.numbersCount) {
    return {
      isValid: false,
      message: `Debes seleccionar exactamente ${config.numbersCount} números`
    };
  }

  // Verificar rango válido
  for (const num of numbers) {
    if (num < 1 || num > config.numbersRange) {
      return {
        isValid: false,
        message: `Los números deben estar entre 1 y ${config.numbersRange}`
      };
    }
  }

  // Verificar números únicos
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) {
    return {
      isValid: false,
      message: 'No puedes repetir números'
    };
  }

  return {
    isValid: true,
    message: 'Números válidos'
  };
}

// 💰 VALIDACIÓN DE MONTO DE APUESTA
export function validateBetAmount(amount: string): ValidationResult {
  try {
    const betAmount = BigInt(amount);
    const defaultAmount = BigInt(defaultBlockchainConfig.defaultBetAmount);

    if (betAmount <= 0) {
      return {
        isValid: false,
        message: 'El monto debe ser mayor a 0'
      };
    }

    if (betAmount < defaultAmount) {
      return {
        isValid: false,
        message: `El monto mínimo es ${defaultAmount.toString()} wei`
      };
    }

    return {
      isValid: true,
      message: 'Monto válido'
    };
  } catch (error) {
    return {
      isValid: false,
      message: 'Monto inválido'
    };
  }
}

// 🏢 VALIDACIÓN DE DATOS DE ONG
export function validateONGData(ongData: {
  name: string;
  description: string;
  walletAddress: string;
  website?: string;
  category: string;
}): ValidationResult {
  // Validar nombre
  if (!ongData.name || ongData.name.trim().length < 3) {
    return {
      isValid: false,
      message: 'El nombre de la ONG debe tener al menos 3 caracteres'
    };
  }

  if (ongData.name.length > 100) {
    return {
      isValid: false,
      message: 'El nombre de la ONG no puede exceder 100 caracteres'
    };
  }

  // Validar descripción
  if (!ongData.description || ongData.description.trim().length < 10) {
    return {
      isValid: false,
      message: 'La descripción debe tener al menos 10 caracteres'
    };
  }

  if (ongData.description.length > 500) {
    return {
      isValid: false,
      message: 'La descripción no puede exceder 500 caracteres'
    };
  }

  // Validar wallet address (formato básico de Ethereum)
  if (!ongData.walletAddress || !ongData.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    return {
      isValid: false,
      message: 'La wallet address debe ser una dirección Ethereum válida'
    };
  }

  // Validar website (opcional)
  if (ongData.website) {
    try {
      new URL(ongData.website);
    } catch {
      return {
        isValid: false,
        message: 'La URL del sitio web no es válida'
      };
    }
  }

  // Validar categoría
  const validCategories = ['HEALTH', 'EDUCATION', 'ENVIRONMENT', 'SOCIAL', 'ANIMALS', 'TECHNOLOGY', 'ARTS', 'SPORTS', 'OTHER'];
  if (!validCategories.includes(ongData.category)) {
    return {
      isValid: false,
      message: 'Categoría de ONG no válida'
    };
  }

  return {
    isValid: true,
    message: 'Datos de ONG válidos'
  };
}

// 🎲 VALIDACIÓN DE PARÁMETROS DE SORTEO
export function validateDrawParameters(): ValidationResult {
  const config = defaultBlockchainConfig;
  
  // Verificar configuración básica
  if (config.numbersCount <= 0 || config.numbersRange <= 0) {
    return {
      isValid: false,
      message: 'Configuración de sorteo inválida'
    };
  }

  if (config.numbersCount > config.numbersRange) {
    return {
      isValid: false,
      message: 'No se pueden seleccionar más números de los disponibles'
    };
  }

  return {
    isValid: true,
    message: 'Parámetros de sorteo válidos'
  };
}

// 📧 VALIDACIÓN DE EMAIL
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Email inválido'
    };
  }

  return {
    isValid: true,
    message: 'Email válido'
  };
}

// 🔐 VALIDACIÓN DE WALLET ADDRESS
export function validateWalletAddress(address: string): ValidationResult {
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return {
      isValid: false,
      message: 'Wallet address inválida'
    };
  }

  return {
    isValid: true,
    message: 'Wallet address válida'
  };
}