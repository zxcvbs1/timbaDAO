// 🔍 API simple para verificar últimos juegos
// Solo disponible en modo desarrollo

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      success: false,
      error: 'Esta función solo está disponible en modo desarrollo'
    })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido'
    })
  }

  try {
    // Obtener últimos 5 juegos
    const latestGames = await prisma.gameSession.findMany({
      orderBy: { playedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        userId: true,
        selectedNumbers: true,
        winningNumbers: true,
        isWinner: true,
        playedAt: true,
        prizeAmount: true
      }
    })

    // Contar juegos pendientes
    const pendingCount = await prisma.gameSession.count({
      where: { winningNumbers: null }
    })

    // Contar total de juegos
    const totalCount = await prisma.gameSession.count()

    console.log('🔍 [LATEST-GAMES] Found games:', latestGames.length)
    console.log('🔍 [LATEST-GAMES] Pending games:', pendingCount)
    console.log('🔍 [LATEST-GAMES] Total games:', totalCount)

    res.status(200).json({
      success: true,
      data: {
        latestGames,
        pendingCount,
        totalCount,
        currentTime: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ [LATEST-GAMES] Error:', error)
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    })
  }
}
