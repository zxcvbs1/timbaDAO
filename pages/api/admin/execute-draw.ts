// 🔧 API DE ADMINISTRADOR: Ejecutar sorteo manualmente
// Solo disponible en modo desarrollo para testing

import type { NextApiRequest, NextApiResponse } from 'next'
import { MockLotteryContract } from '@/lib/blockchain/mock-lottery'

interface AdminDrawRequest {
  winningNumbers?: number[]; // Números específicos para testing (opcional)
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido'
    })
  }

  try {
    const { winningNumbers }: AdminDrawRequest = req.body || {}
    
    if (winningNumbers) {
      console.log('🎯 [ADMIN] Executing manual draw with specific numbers:', winningNumbers)
    } else {
      console.log('🔧 [ADMIN] Executing manual draw with random numbers...')
    }
    
    const mockContract = new MockLotteryContract()
    const result = await mockContract.triggerDraw(winningNumbers)
    
    console.log('✅ [ADMIN] Draw executed successfully:', {
      winningNumbers: result.winningNumbers,
      winnersCount: result.winners.length,
      totalPrizePool: result.totalPrizePool
    })

    res.status(200).json({
      success: true,
      result: {
        winningNumbers: result.winningNumbers,
        winners: result.winners,
        totalPrizePool: result.totalPrizePool,
        transactionHash: result.transactionHash,
        drawId: result.drawId
      }
    })

  } catch (error: any) {
    console.error('❌ [ADMIN] Error executing draw:', error)
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    })
  }
}
