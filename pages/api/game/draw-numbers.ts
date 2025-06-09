// 🎲 API ENDPOINT: Realizar sorteo de números
// POST /api/game/draw-numbers

import { NextApiRequest, NextApiResponse } from 'next';
import { lotteryContract } from '../../../src/lib/blockchain';
import { PrismaClient } from '../../../src/generated/prisma';

const prisma = new PrismaClient();

interface DrawNumbersRequest {
  adminKey?: string; // Para validar que es un admin quien ejecuta el sorteo
  force?: boolean;   // Para forzar sorteo aunque no se cumplan condiciones mínimas
}

interface DrawNumbersResponse {
  success: boolean;
  message: string;
  data?: {
    winningNumbers: number[];
    winners: Array<{
      userId: string;
      gameId: string;
      prizeAmount: string;
      matchedNumbers: number;
      walletAddress?: string;
    }>;
    transactionHash: string;
    totalPrizePool: string;
    drawId: string;
    distributionTx?: string;
    stats: {
      totalGames: number;
      totalWinners: number;
      totalPrizeDistributed: string;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DrawNumbersResponse>
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
    // 📝 EXTRAER PARÁMETROS
    const { adminKey, force }: DrawNumbersRequest = req.body;

    // 🔐 VALIDAR AUTORIZACIÓN (para sorteos manuales)
    if (adminKey && adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'Invalid admin key'
      });
    }

    // 📊 VERIFICAR CONDICIONES PREVIAS
    const activeGames = await prisma.gameSession.count({
      where: {
        winningNumbers: null, // Juegos que no han sido sorteados
        playedAt: {
          // Solo juegos de las últimas 24 horas
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!force && activeGames === 0) {
      return res.status(400).json({
        success: false,
        message: 'No games available for draw',
        error: 'There are no active games to draw numbers for'
      });
    }

    // 🎯 OBTENER ESTADÍSTICAS PRE-SORTEO
    const totalPool = await lotteryContract.getCurrentPool();
    
    console.log('🎲 [API] Starting number draw:', {
      activeGames,
      totalPool,
      forced: !!force
    });

    // 🎰 EJECUTAR SORTEO EN EL CONTRATO
    const drawResult = await lotteryContract.drawNumbers(force || false);

    // 📊 CALCULAR ESTADÍSTICAS FINALES
    const stats = {
      totalGames: activeGames,
      totalWinners: drawResult.winners.length,
      totalPrizeDistributed: drawResult.winners.reduce(
        (total, winner) => (BigInt(total) + BigInt(winner.prizeAmount)).toString(),
        '0'
      )
    };

    console.log('✅ [API] Draw completed successfully:', {
      drawId: drawResult.drawId,
      winningNumbers: drawResult.winningNumbers,
      winnersCount: drawResult.winners.length,
      transactionHash: drawResult.transactionHash
    });

    // 🎯 RESPUESTA EXITOSA
    return res.status(200).json({
      success: true,
      message: 'Numbers drawn successfully',
      data: {
        winningNumbers: drawResult.winningNumbers,
        winners: drawResult.winners,
        transactionHash: drawResult.transactionHash,
        totalPrizePool: drawResult.totalPrizePool,
        drawId: drawResult.drawId,
        distributionTx: drawResult.distributionTx,
        stats
      }
    });

  } catch (error) {
    console.error('❌ [API] Error drawing numbers:', error);

    // Manejar errores específicos
    if (error instanceof Error) {
      // Error de condiciones no cumplidas
      if (error.message.includes('minimum players') || error.message.includes('No active games')) {
        return res.status(400).json({
          success: false,
          message: 'Draw conditions not met',
          error: error.message
        });
      }

      // Error de contrato
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
        message: 'Failed to draw numbers',
        error: error.message
      });
    }

    // Error completamente desconocido
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred during the draw'
    });
  }
}

// 🔄 FUNCIÓN HELPER PARA SORTEOS AUTOMÁTICOS
export async function executeAutomaticDraw(): Promise<{
  success: boolean;
  message: string;
  drawResult?: any;
}> {
  try {
    console.log('⏰ [CRON] Starting automatic draw...');

    // Verificar si hay juegos para sortear
    const activeGames = await prisma.gameSession.count({
      where: {
        winningNumbers: null,
        playedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (activeGames === 0) {
      return {
        success: false,
        message: 'No games available for automatic draw'
      };
    }

    // Ejecutar sorteo
    const drawResult = await lotteryContract.drawNumbers();

    console.log('✅ [CRON] Automatic draw completed:', {
      drawId: drawResult.drawId,
      winnersCount: drawResult.winners.length
    });

    return {
      success: true,
      message: 'Automatic draw executed successfully',
      drawResult
    };

  } catch (error) {
    console.error('❌ [CRON] Error in automatic draw:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}