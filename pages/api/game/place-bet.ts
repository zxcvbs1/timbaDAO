// 🎰 API ENDPOINT: Realizar apuesta en la lotería
// POST /api/game/place-bet

import { NextApiRequest, NextApiResponse } from 'next';
import { MockLotteryContract } from '../../../src/lib/blockchain/mock-lottery';
import { prisma } from '../../../src/lib/prisma';
import { validateLotteryNumbers, validateBetAmount } from '../../../src/lib/validations';

interface PlaceBetRequest {
  userId: string;
  selectedNumbers: number[];
  selectedOngId: string;
  betAmount?: string; // Opcional, usa default si no se especifica
}

interface PlaceBetResponse {
  success: boolean;
  message: string;
  data?: {
    gameId: string;
    transactionHash: string;
    blockNumber: number;
    contributionAmount: string;
    poolContribution: string;
    gasUsed?: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PlaceBetResponse>
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
    const { userId, selectedNumbers, selectedOngId, betAmount }: PlaceBetRequest = req.body;

    // Validaciones básicas
    if (!userId || !selectedNumbers || !selectedOngId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'userId, selectedNumbers, and selectedOngId are required'
      });
    }

    // Normalize userId to lowercase for database lookup, consistent with user creation
    const normalizedUserIdForDB = userId.toLowerCase();

    // 🔍 VALIDAR USUARIO
    const user = await prisma.user.findUnique({
      where: { id: normalizedUserIdForDB } // Use normalized ID for lookup
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: `User with id ${userId} does not exist` // Error message still shows original ID from request
      });
    }

    // 🔍 VALIDAR ONG
    const ong = await prisma.approvedONG.findUnique({
      where: { id: selectedOngId, isActive: true }
    });

    if (!ong) {
      return res.status(404).json({
        success: false,
        message: 'ONG not found or inactive',
        error: `ONG with id ${selectedOngId} does not exist or is not active`
      });
    }

    // 🎯 VALIDAR NÚMEROS DE LOTERÍA
    const numbersValidation = validateLotteryNumbers(selectedNumbers);
    if (!numbersValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lottery numbers',
        error: numbersValidation.message
      });
    }

    // 💰 VALIDAR MONTO DE APUESTA
    const finalBetAmount = betAmount || '1000000000000000000'; // 1 MNT por defecto
    const amountValidation = validateBetAmount(finalBetAmount);
    if (!amountValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bet amount',
        error: amountValidation.message
      });
    }

    // 🎰 EJECUTAR APUESTA EN EL CONTRATO
    console.log('🎰 [API] Processing bet:', {
      userId,
      selectedNumbers,
      selectedOngId,
      betAmount: finalBetAmount
    });

    console.log('🎭 [MOCK] Using mock lottery contract for development');
    const mockContract = new MockLotteryContract();
    
    const result = await mockContract.placeBet(
      userId, // Assuming contract handles casing or prefers original checksummed address
      selectedNumbers,
      selectedOngId,
      finalBetAmount
    );

    // 📊 ACTUALIZAR PARTICIPACIONES DEL USUARIO
    await prisma.user.update({
      where: { id: normalizedUserIdForDB }, // Use normalized ID for update
      data: {
        participations: { increment: 1 }
      }
    });

    // 📊 ACTUALIZAR ESTADÍSTICAS DE LA ONG
    const currentOng = await prisma.approvedONG.findUnique({
      where: { id: selectedOngId },
      select: { totalFundsReceived: true }
    });

    const currentTotal = BigInt(currentOng?.totalFundsReceived || '0');
    const newTotal = currentTotal + BigInt(result.contributionAmount);

    await prisma.approvedONG.update({
      where: { id: selectedOngId },
      data: {
        totalGamesSupporting: { increment: 1 },
        totalFundsReceived: newTotal.toString()
      }
    });

    console.log('✅ [API] Bet placed successfully:', {
      gameId: result.gameId,
      transactionHash: result.transactionHash
    });

    // 🎯 RESPUESTA EXITOSA
    return res.status(200).json({
      success: true,
      message: 'Bet placed successfully',
      data: {
        gameId: result.gameId,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        contributionAmount: result.contributionAmount,
        poolContribution: result.poolContribution,
        gasUsed: result.gasUsed
      }
    });

  } catch (error) {
    console.error('❌ [API] Error placing bet:', error);

    // Manejar errores específicos
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to place bet',
        error: error.message
      });
    }

    // Error genérico
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred while placing the bet'
    });
  }
}