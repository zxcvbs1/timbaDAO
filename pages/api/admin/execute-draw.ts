// 🔧 API DE ADMINISTRADOR: Ejecutar sorteo manualmente
// Solo disponible en modo desarrollo para testing

import type { NextApiRequest, NextApiResponse } from 'next'
import { MockLotteryContract } from '@/lib/blockchain/mock-lottery'
import { lotteryEvents, LOTTERY_EVENTS } from '../../../src/lib/event-emitter'

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
    
    // 🔍 OBTENER PARTICIPANTES ANTES DEL SORTEO
    console.log('🔍 [ADMIN] Getting participants BEFORE draw execution...')
    const mockContract = new MockLotteryContract()
    const participantsBeforeDraw = await mockContract.getPendingGames(true)
    
    console.log('🔍 [ADMIN] Participants found BEFORE draw:', participantsBeforeDraw.length)
    participantsBeforeDraw.forEach(p => {
      console.log('🎫 [ADMIN] Participant:', {
        id: p.id,
        userId: p.userId,
        selectedNumbers: p.selectedNumbers
      })
    })
    
    // Generar drawId único
    const drawId = `draw_${Date.now()}`
    console.log('📡 [ADMIN] Emitting DRAW_STARTED event:', drawId)
    lotteryEvents.emit(LOTTERY_EVENTS.DRAW_STARTED, {
      drawId,
      startTime: new Date().toISOString(),
      estimatedDuration: 5000, // 5 segundos
      participantCount: participantsBeforeDraw.length
    })
    
    // Ejecutar el sorteo
    const result = await mockContract.triggerDraw(winningNumbers)
    
    // Usar el mismo drawId para todos los eventos
    result.drawId = drawId
    
    // Emitir evento de números sorteados
    console.log('📡 [ADMIN] Emitting NUMBERS_DRAWN event:', result.winningNumbers)
    lotteryEvents.emit(LOTTERY_EVENTS.NUMBERS_DRAWN, {
      drawId: result.drawId,
      numbers: result.winningNumbers.join(''),
      timestamp: new Date().toISOString()
    })
    
    // 🎫 EMITIR EVENTOS TICKET_RESULT PARA TODOS LOS PARTICIPANTES
    console.log('🎫 [ADMIN] Emitting TICKET_RESULT events for ALL participants...')
    
    // Primero para los ganadores
    console.log('📡 [ADMIN] Emitting TICKET_RESULT events for', result.winners.length, 'winners')
    result.winners.forEach(winner => {
      console.log('🎫 [ADMIN] Emitting winner result for:', winner.player)
      lotteryEvents.emit(LOTTERY_EVENTS.TICKET_RESULT, {
        ticketId: winner.ticketId,
        userAddress: winner.player,
        numbers: result.winningNumbers.join(''),
        isWinner: true,
        drawId: result.drawId
      })
    })
    
    // Luego para TODOS los participantes que NO ganaron
    const winnerUserIds = new Set(result.winners.map(w => w.player))
    const losers = participantsBeforeDraw.filter(participant => !winnerUserIds.has(participant.userId))
    
    console.log('🔍 [ADMIN] Processing losers:', losers.length)
    losers.forEach(participant => {
      console.log('🎫 [ADMIN] Emitting loser result for:', {
        participantId: participant.id,
        userId: participant.userId,
        selectedNumbers: participant.selectedNumbers
      })
      lotteryEvents.emit(LOTTERY_EVENTS.TICKET_RESULT, {
        ticketId: participant.id,
        userAddress: participant.userId,
        numbers: result.winningNumbers.join(''),
        isWinner: false,
        drawId: result.drawId
      })
    })
    
    console.log('📡 [ADMIN] Total TICKET_RESULT events emitted:', result.winners.length + losers.length)
    
    // Emitir evento de sorteo completado
    console.log('📡 [ADMIN] Emitting DRAW_COMPLETED event:', result.drawId)
    lotteryEvents.emit(LOTTERY_EVENTS.DRAW_COMPLETED, {
      drawId: result.drawId,
      winningNumbers: result.winningNumbers.join(''),
      completedAt: new Date().toISOString(),
      totalWinners: result.winners.length,
      totalParticipants: participantsBeforeDraw.length
    })
    
    console.log('✅ [ADMIN] Draw executed successfully:', {
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
