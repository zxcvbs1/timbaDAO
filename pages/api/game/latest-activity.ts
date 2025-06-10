// 🕒 API ENDPOINT: Obtener timestamp de la última actividad del juego
// GET /api/game/latest-activity

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '../../../src/generated/prisma';

const prisma = new PrismaClient();

interface LatestActivityResponse {
  success: boolean;
  lastGameTime?: number;
  lastDrawTime?: number;
  totalActiveGames?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LatestActivityResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Obtener el timestamp del último juego
    const lastGame = await prisma.gameSession.findFirst({
      orderBy: { playedAt: 'desc' },
      select: { playedAt: true }
    });

    // Obtener el timestamp del último sorteo
    const lastDraw = await prisma.gameSession.findFirst({
      where: { 
        winningNumbers: { not: null }
      },
      orderBy: { confirmedAt: 'desc' },
      select: { confirmedAt: true }
    });

    // Contar juegos activos (sin sortear)
    const activeGames = await prisma.gameSession.count({
      where: {
        winningNumbers: null,
        playedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      }
    });

    return res.status(200).json({
      success: true,
      lastGameTime: lastGame?.playedAt ? new Date(lastGame.playedAt).getTime() : 0,
      lastDrawTime: lastDraw?.confirmedAt ? new Date(lastDraw.confirmedAt).getTime() : 0,
      totalActiveGames: activeGames
    });

  } catch (error) {
    console.error('❌ [API] Error getting latest activity:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
