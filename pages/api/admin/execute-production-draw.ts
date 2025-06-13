// 🚀 API DE PRODUCCIÓN: Ejecutar sorteo en producción
// Endpoint seguro para ejecutar sorteos en ambiente de producción

import type { NextApiRequest, NextApiResponse } from 'next'
import { MockLotteryContract } from '@/lib/blockchain/mock-lottery'
import { prisma } from '../../../src/lib/prisma'

interface ProductionDrawRequest {
  adminKey: string;
  winningNumbers?: number[]; // Números específicos (opcional)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido - usar POST'
    })
  }

  try {
    const { adminKey, winningNumbers }: ProductionDrawRequest = req.body

    // Verificar clave de administrador
    const expectedAdminKey = process.env.ADMIN_KEY || 'CHANGE_THIS_IN_PRODUCTION'
    
    if (!adminKey || adminKey !== expectedAdminKey) {
      return res.status(401).json({
        success: false,
        error: 'Acceso no autorizado - clave de administrador inválida'
      })
    }

    console.log('🚀 [PRODUCTION] Executing draw with admin authentication')
    if (winningNumbers) {
      console.log('🎯 [PRODUCTION] Using specific numbers:', winningNumbers)
    } else {
      console.log('🎲 [PRODUCTION] Using random numbers')
    }
    
    // Verificar que hay participantes antes del sorteo
    const mockContract = new MockLotteryContract()
    const participantsBeforeDraw = await mockContract.getPendingGames(true)
    
    console.log('🔍 [PRODUCTION] Participants found:', participantsBeforeDraw.length)
    
    if (participantsBeforeDraw.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay juegos pendientes para ejecutar el sorteo'
      })
    }
    
    // Ejecutar el sorteo
    const result = await mockContract.triggerDraw(winningNumbers)
    
    console.log('✅ [PRODUCTION] Draw executed successfully:', {
      winningNumbers: result.winningNumbers,
      winnersCount: result.winners.length,
      totalParticipants: participantsBeforeDraw.length
    })

    res.status(200).json({
      success: true,
      message: 'Sorteo ejecutado exitosamente en producción',
      result: {
        winningNumbers: result.winningNumbers,
        winners: result.winners,
        totalPrizePool: result.totalPrizePool,
        transactionHash: result.transactionHash,
        drawId: result.drawId,
        executedAt: new Date().toISOString(),
        environment: 'production'
      }
    })

  } catch (error: any) {
    console.error('❌ [PRODUCTION] Error executing draw:', error)
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    })
  }
}
