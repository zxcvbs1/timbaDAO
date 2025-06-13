// 🔍 API para verificar juegos pendientes
// Solo disponible en modo desarrollo para debugging

import type { NextApiRequest, NextApiResponse } from 'next'
import { MockLotteryContract } from '@/lib/blockchain/mock-lottery'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir en desarrollo
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
    const mockContract = new MockLotteryContract()
    
    console.log('🔍 [CHECK-PENDING] Checking pending games...')
    
    // Verificar juegos pendientes (con y sin force)
    const pendingGamesRecent = await mockContract.getPendingGames(false)
    const pendingGamesAll = await mockContract.getPendingGames(true)
    
    console.log('🔍 [CHECK-PENDING] Recent pending games:', pendingGamesRecent.length)
    console.log('🔍 [CHECK-PENDING] All pending games:', pendingGamesAll.length)
    
    // Log detalles de cada juego
    pendingGamesAll.forEach((game, index) => {
      console.log(`🎫 [CHECK-PENDING] Game ${index + 1}:`, {
        id: game.id,
        userId: game.userId,
        selectedNumbers: game.selectedNumbers,
        playedAt: game.playedAt,
        winningNumbers: game.winningNumbers
      })
    })

    res.status(200).json({
      success: true,
      data: {
        recentPendingGames: pendingGamesRecent.length,
        allPendingGames: pendingGamesAll.length,
        games: pendingGamesAll.map(game => ({
          id: game.id,
          userId: game.userId,
          selectedNumbers: game.selectedNumbers,
          playedAt: game.playedAt,
          timeSinceCreated: Date.now() - new Date(game.playedAt).getTime()
        }))
      }
    })

  } catch (error: any) {
    console.error('❌ [CHECK-PENDING] Error:', error)
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    })
  }
}
