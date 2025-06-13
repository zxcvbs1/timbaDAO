// 🧪 API de testing para eventos SSE
// Permite emitir eventos de prueba para verificar el sistema

import type { NextApiRequest, NextApiResponse } from 'next'
import { lotteryEvents, LOTTERY_EVENTS } from '../../../src/lib/event-emitter'

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
    const { eventType, data } = req.body

    console.log('🧪 [TEST-EVENTS] Testing event emission:', eventType)
    console.log('🧪 [TEST-EVENTS] Event emitter exists:', !!lotteryEvents)
    console.log('🧪 [TEST-EVENTS] Available events:', Object.values(LOTTERY_EVENTS))

    const testDrawId = `test_draw_${Date.now()}`

    switch (eventType) {
      case 'draw-started':
        lotteryEvents.emit(LOTTERY_EVENTS.DRAW_STARTED, {
          drawId: testDrawId,
          startTime: new Date().toISOString(),
          estimatedDuration: 5000,
          participantCount: 1
        })
        break

      case 'numbers-drawn':
        lotteryEvents.emit(LOTTERY_EVENTS.NUMBERS_DRAWN, {
          drawId: testDrawId,
          numbers: '42',
          timestamp: new Date().toISOString()
        })
        break

      case 'ticket-result':
        lotteryEvents.emit(LOTTERY_EVENTS.TICKET_RESULT, {
          ticketId: 'test_ticket_123',
          userAddress: 'test_user',
          numbers: '42',
          isWinner: data?.isWinner || true,
          drawId: testDrawId
        })
        break

      case 'draw-completed':
        lotteryEvents.emit(LOTTERY_EVENTS.DRAW_COMPLETED, {
          drawId: testDrawId,
          winningNumbers: '42',
          completedAt: new Date().toISOString(),
          totalWinners: 1,
          totalParticipants: 1
        })
        break

      case 'new-ticket':
        lotteryEvents.emit(LOTTERY_EVENTS.NEW_TICKET, {
          ticketId: 'test_ticket_123',
          userAddress: 'test_user',
          numbers: '42',
          ongId: 'test_ong',
          timestamp: new Date().toISOString()
        })
        break

      case 'all-sequence':
        // Emitir secuencia completa de eventos
        console.log('🧪 [TEST-EVENTS] Emitting complete sequence...')
        
        setTimeout(() => {
          lotteryEvents.emit(LOTTERY_EVENTS.DRAW_STARTED, {
            drawId: testDrawId,
            startTime: new Date().toISOString(),
            estimatedDuration: 5000,
            participantCount: 1
          })
        }, 0)

        setTimeout(() => {
          lotteryEvents.emit(LOTTERY_EVENTS.NUMBERS_DRAWN, {
            drawId: testDrawId,
            numbers: '42',
            timestamp: new Date().toISOString()
          })
        }, 1000)

        setTimeout(() => {
          lotteryEvents.emit(LOTTERY_EVENTS.TICKET_RESULT, {
            ticketId: 'test_ticket_123',
            userAddress: 'test_user',
            numbers: '42',
            isWinner: true,
            drawId: testDrawId
          })
        }, 2000)

        setTimeout(() => {
          lotteryEvents.emit(LOTTERY_EVENTS.DRAW_COMPLETED, {
            drawId: testDrawId,
            winningNumbers: '42',
            completedAt: new Date().toISOString(),
            totalWinners: 1,
            totalParticipants: 1
          })
        }, 3000)
        break

      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de evento no válido. Opciones: draw-started, numbers-drawn, ticket-result, draw-completed, new-ticket, all-sequence'
        })
    }

    // Verificar listeners
    console.log('🧪 [TEST-EVENTS] Current listener counts:')
    Object.values(LOTTERY_EVENTS).forEach(event => {
      const count = lotteryEvents.listenerCount(event)
      console.log(`  - ${event}: ${count} listeners`)
    })

    res.status(200).json({
      success: true,
      message: `Evento ${eventType} emitido correctamente`,
      drawId: testDrawId,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ [TEST-EVENTS] Error emitting test event:', error)
    
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    })
  }
}
