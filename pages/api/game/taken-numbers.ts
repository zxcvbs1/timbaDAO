// 🎯 API ENDPOINT: Obtener números ya tomados en la ronda actual
// GET /api/game/taken-numbers

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../src/generated/prisma';

const prisma = new PrismaClient();

interface TakenNumbersResponse {
  success: boolean;
  takenNumbers: number[];
  totalTaken: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TakenNumbersResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      takenNumbers: [],
      totalTaken: 0,
      error: 'Method not allowed'
    });
  }

  try {
    // Obtener todos los juegos pendientes (sin sortear)
    const pendingGames = await prisma.gameSession.findMany({
      where: {
        winningNumbers: null, // Solo juegos pendientes
        playedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      select: {
        selectedNumbers: true,
        userId: true,
        playedAt: true
      },
      orderBy: {
        playedAt: 'desc'
      }
    });

    // Extraer números únicos tomados
    const takenNumbers: number[] = [];
    const seenNumbers = new Set<number>();

    for (const game of pendingGames) {
      const number = parseInt(game.selectedNumbers);
      if (!seenNumbers.has(number)) {
        takenNumbers.push(number);
        seenNumbers.add(number);
      }
    }

    // Ordenar números
    takenNumbers.sort((a, b) => a - b);

    console.log(`📊 [API] Taken numbers retrieved: ${takenNumbers.length}/100 numbers taken`);

    return res.status(200).json({
      success: true,
      takenNumbers,
      totalTaken: takenNumbers.length
    });

  } catch (error) {
    console.error('❌ [API] Error getting taken numbers:', error);
    return res.status(500).json({
      success: false,
      takenNumbers: [],
      totalTaken: 0,
      error: 'Internal server error'
    });
  }
}
