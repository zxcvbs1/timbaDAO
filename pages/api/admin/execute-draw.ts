// 🔧 API DE ADMINISTRADOR: Ejecutar sorteo manualmente
// Solo disponible en modo desarrollo para testing

import type { NextApiRequest, NextApiResponse } from 'next'
import { MockLotteryContract } from '@/lib/blockchain/mock-lottery'
import { prisma } from '../../../src/lib/prisma'

interface AdminDrawRequest {
  winningNumbers?: number[]; // Números específicos para testing (opcional)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar autenticación de administrador
  const adminKey = req.headers['x-admin-key'] || req.body.adminKey
  const expectedAdminKey = process.env.ADMIN_KEY || 'admin123' // Cambia esto por una clave segura
  
  if (adminKey !== expectedAdminKey) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado - clave de administrador requerida'
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
    
    // 🔍 OBTENER PARTICIPANTES ANTES DEL SORTEO
    console.log('🔍 [ADMIN] Getting participants BEFORE draw execution...')
    const mockContract = new MockLotteryContract()
    
    // ADD: Check if there are pending games before calling triggerDraw
    console.log('🔍 [ADMIN] Checking for pending games in DB directly...')
    const pendingGamesDirectCheck = await prisma.gameSession.findMany({
      where: { winningNumbers: null },
      select: { id: true, userId: true, selectedNumbers: true, playedAt: true }
    })
    console.log('🔍 [ADMIN] Direct DB check - Pending games:', pendingGamesDirectCheck.length)
    pendingGamesDirectCheck.forEach(game => {
      console.log('🎫 [ADMIN] Direct DB - Pending game:', {
        id: game.id,
        userId: game.userId,
        selectedNumbers: game.selectedNumbers,
        playedAt: game.playedAt
      })
    })
    
    const participantsBeforeDraw = await mockContract.getPendingGames(true)
    
    console.log('🔍 [ADMIN] Participants found BEFORE draw via mockContract.getPendingGames(true):', participantsBeforeDraw.length)
    participantsBeforeDraw.forEach(p => {
      console.log('🎫 [ADMIN] Participant via mockContract:', {
        id: p.id,
        userId: p.userId,
        selectedNumbers: p.selectedNumbers
      })
    })
    
    // If no participants, don't proceed with the draw (even in development)
    if (participantsBeforeDraw.length === 0 && pendingGamesDirectCheck.length === 0) {
      console.log('⚠️ [ADMIN] No pending games found. Cannot execute draw.')
      return res.status(400).json({
        success: false,
        error: 'No hay juegos pendientes para ejecutar el sorteo'
      })
    }
      // Generar drawId único
    const drawId = `draw_${Date.now()}`
    console.log('🎲 [ADMIN] Starting draw execution:', drawId, '(SSE events disabled - system uses polling)')
    
    // Ejecutar el sorteo
    console.log('🎲 [ADMIN] About to call mockContract.triggerDraw...')
    const result = await mockContract.triggerDraw(winningNumbers)
    console.log('🎲 [ADMIN] triggerDraw completed with result:', {
      winningNumbers: result.winningNumbers,
      winnersCount: result.winners?.length || 0,
      drawId: result.drawId
    })
      // Usar el mismo drawId para todos los eventos
    result.drawId = drawId
    
    console.log('🎲 [ADMIN] Draw execution completed (SSE events disabled - system uses polling):', {
      winningNumbers: result.winningNumbers,
      winnersCount: result.winners?.length || 0,
      drawId: result.drawId
    })    
    console.log('✅ [ADMIN] Draw executed successfully (SSE events disabled - polling handles updates):', {
      winningNumbers: result.winningNumbers,
      winnersCount: result.winners.length,
      totalPrizePool: result.totalPrizePool,
      participantsProcessed: participantsBeforeDraw.length
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
