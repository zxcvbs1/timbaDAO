// 🎯 Server-Sent Events endpoint para eventos de lotería en tiempo real
// Permite a los clientes recibir actualizaciones automáticas de sorteos y resultados

import type { NextApiRequest, NextApiResponse } from 'next'
import { lotteryEvents, LOTTERY_EVENTS } from '../../../src/lib/event-emitter'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔌 [SSE] Stream handler called. Method:', req.method);
  console.log('🔌 [SSE] Current event emitter instance:', !!lotteryEvents);
  console.log('🔌 [SSE] Available events:', Object.values(LOTTERY_EVENTS));
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Configurar headers para Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Cache-Control'
  })

  // Función para enviar eventos al cliente
  const sendEvent = (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    console.log('📤 [SSE] Sending event:', event, 'Data:', data)
    try {
      res.write(message)
      console.log('✅ [SSE] Event sent successfully')
    } catch (error) {
      console.error('❌ [SSE] Error writing event:', error)
    }
  }

  // Enviar evento inicial de conexión
  sendEvent('connected', { 
    message: 'Conectado al sistema de eventos de lotería',
    timestamp: new Date().toISOString(),
    serverTime: Date.now()
  })

  console.log('✅ [SSE] Client connected, connection event sent')

  // Listeners para todos los eventos de lotería
  const handleDrawStarted = (data: any) => {
    console.log('📡 [SSE] Broadcasting draw-started event to client:', data)
    try {
      sendEvent('draw-started', data)
      console.log('✅ [SSE] draw-started event sent successfully to client')
    } catch (error) {
      console.error('❌ [SSE] Error sending draw-started event:', error)
    }
  }

  const handleDrawCompleted = (data: any) => {
    console.log('📡 [SSE] Broadcasting draw-completed event:', data)
    try {
      sendEvent('draw-completed', data)
      console.log('✅ [SSE] draw-completed event sent successfully')
    } catch (error) {
      console.error('❌ [SSE] Error sending draw-completed event:', error)
    }
  }

  const handleNumbersDrawn = (data: any) => {
    console.log('📡 [SSE] Broadcasting numbers-drawn event:', data)
    try {
      sendEvent('numbers-drawn', data)
      console.log('✅ [SSE] numbers-drawn event sent successfully')
    } catch (error) {
      console.error('❌ [SSE] Error sending numbers-drawn event:', error)
    }
  }

  const handleTicketResult = (data: any) => {
    console.log('📡 [SSE] Broadcasting ticket-result event:', data)
    try {
      sendEvent('ticket-result', data)
      console.log('✅ [SSE] ticket-result event sent successfully to client')
    } catch (error) {
      console.error('❌ [SSE] Error sending ticket-result event:', error)
    }
  }

  const handleNewTicket = (data: any) => {
    console.log('📡 [SSE] Broadcasting new-ticket event:', data)
    sendEvent('new-ticket', data)
  }

  // Registrar todos los listeners
  console.log('📝 [SSE] Registering event listeners...')
  console.log('📝 [SSE] EventEmitter instance:', lotteryEvents)
  console.log('📝 [SSE] EventEmitter prototype:', Object.getPrototypeOf(lotteryEvents))
  
  lotteryEvents.on(LOTTERY_EVENTS.DRAW_STARTED, handleDrawStarted)
  lotteryEvents.on(LOTTERY_EVENTS.DRAW_COMPLETED, handleDrawCompleted)
  lotteryEvents.on(LOTTERY_EVENTS.NUMBERS_DRAWN, handleNumbersDrawn)
  lotteryEvents.on(LOTTERY_EVENTS.TICKET_RESULT, handleTicketResult)
  lotteryEvents.on(LOTTERY_EVENTS.NEW_TICKET, handleNewTicket)
  
  console.log('📝 [SSE] Event listeners registered. Current listener counts:')
  console.log('  - DRAW_STARTED:', lotteryEvents.listenerCount(LOTTERY_EVENTS.DRAW_STARTED))
  console.log('  - DRAW_COMPLETED:', lotteryEvents.listenerCount(LOTTERY_EVENTS.DRAW_COMPLETED))
  console.log('  - NUMBERS_DRAWN:', lotteryEvents.listenerCount(LOTTERY_EVENTS.NUMBERS_DRAWN))
  console.log('  - TICKET_RESULT:', lotteryEvents.listenerCount(LOTTERY_EVENTS.TICKET_RESULT))
  console.log('  - NEW_TICKET:', lotteryEvents.listenerCount(LOTTERY_EVENTS.NEW_TICKET))
  
  // Test: Emitir un evento de prueba para verificar conectividad
  console.log('🧪 [SSE] Testing event emission...')
  setTimeout(() => {
    console.log('🧪 [SSE] Emitting test draw-started event')
    lotteryEvents.emit(LOTTERY_EVENTS.DRAW_STARTED, {
      drawId: 'test_connection_' + Date.now(),
      startTime: new Date().toISOString(),
      estimatedDuration: 1000,
      participantCount: 0
    })
  }, 1000)

  // Heartbeat para mantener la conexión viva
  const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log('🔗 [SSE] Creating heartbeat for connection:', connectionId)
  
  const heartbeat = setInterval(() => {
    try {
      sendEvent('heartbeat', { 
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
        connectionId
      })
    } catch (error) {
      console.error('❌ [SSE] Error sending heartbeat:', error)
      clearInterval(heartbeat)
    }
  }, 30000) // Cada 30 segundos

  // Función de limpieza
  const cleanup = () => {
    console.log('🧹 [SSE] Cleaning up connection...')
    
    // Limpiar heartbeat
    clearInterval(heartbeat)
    
    // Remover listeners
    lotteryEvents.off(LOTTERY_EVENTS.DRAW_STARTED, handleDrawStarted)
    lotteryEvents.off(LOTTERY_EVENTS.DRAW_COMPLETED, handleDrawCompleted)
    lotteryEvents.off(LOTTERY_EVENTS.NUMBERS_DRAWN, handleNumbersDrawn)
    lotteryEvents.off(LOTTERY_EVENTS.TICKET_RESULT, handleTicketResult)
    lotteryEvents.off(LOTTERY_EVENTS.NEW_TICKET, handleNewTicket)
    
    console.log('🧹 [SSE] Cleanup completed. Remaining listener counts:')
    console.log('  - DRAW_STARTED:', lotteryEvents.listenerCount(LOTTERY_EVENTS.DRAW_STARTED))
    console.log('  - DRAW_COMPLETED:', lotteryEvents.listenerCount(LOTTERY_EVENTS.DRAW_COMPLETED))
    console.log('  - NUMBERS_DRAWN:', lotteryEvents.listenerCount(LOTTERY_EVENTS.NUMBERS_DRAWN))
    console.log('  - TICKET_RESULT:', lotteryEvents.listenerCount(LOTTERY_EVENTS.TICKET_RESULT))
    console.log('  - NEW_TICKET:', lotteryEvents.listenerCount(LOTTERY_EVENTS.NEW_TICKET))
    
    try {
      res.end()
    } catch (error) {
      console.error('❌ [SSE] Error ending response:', error)
    }
  }

  // Cleanup cuando el cliente se desconecta
  req.on('close', () => {
    console.log('🔌 [SSE] Client disconnected from event stream')
    cleanup()
  })

  // Cleanup cuando hay error
  req.on('error', (error) => {
    console.error('❌ [SSE] Stream error:', error)
    cleanup()
  })
}
