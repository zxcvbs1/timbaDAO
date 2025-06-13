// 🎯 Hook personalizado para consumir eventos de lotería en tiempo real
// Utiliza Server-Sent Events para recibir actualizaciones automáticas

import { useEffect, useRef, useState, useCallback } from 'react'
import type { 
  DrawStartedEvent, 
  DrawCompletedEvent, 
  NumbersDrawnEvent, 
  TicketResultEvent,
  NewTicketEvent
} from '../lib/event-emitter'

export interface LotteryEventHandlers {
  onDrawStarted?: (event: DrawStartedEvent) => void
  onDrawCompleted?: (event: DrawCompletedEvent) => void
  onNumbersDrawn?: (event: NumbersDrawnEvent) => void
  onTicketResult?: (event: TicketResultEvent) => void
  onNewTicket?: (event: NewTicketEvent) => void
  onConnectionChange?: (connected: boolean) => void
  onError?: (error: string) => void
}

export function useLotteryEvents(handlers: LotteryEventHandlers = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    // No crear nueva conexión si ya existe una activa
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      console.log('🔄 [LotteryEvents] Connection already exists, skipping...')
      return
    }

    try {
      console.log('🔌 [LotteryEvents] Connecting to event stream... Attempt:', connectionAttempts + 1)
      const eventSource = new EventSource('/api/events/stream')
      eventSourceRef.current = eventSource
      setConnectionAttempts(prev => prev + 1)

      eventSource.onopen = () => {
        console.log('✅ [LotteryEvents] Connected to event stream')
        setIsConnected(true)
        setConnectionAttempts(0) // Reset counter on successful connection
        handlers.onConnectionChange?.(true)
      }

      eventSource.onerror = (error) => {
        console.error('❌ [LotteryEvents] EventSource error:', error)
        console.log('📊 [LotteryEvents] EventSource readyState:', eventSource.readyState)
        setIsConnected(false)
        handlers.onConnectionChange?.(false)
        handlers.onError?.('Conexión perdida con el servidor de eventos')
        
        // Auto-reconnect logic
        if (connectionAttempts < 5 && eventSource.readyState === EventSource.CLOSED) {
          console.log('🔄 [LotteryEvents] Scheduling reconnection in 3 seconds...')
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      }

      // Event listeners para cada tipo de evento
      eventSource.addEventListener('connected', (event) => {
        console.log('🎉 [LotteryEvents] Connected event received:', event.data)
        const data = JSON.parse(event.data)
        console.log('🎉 [LotteryEvents] Server time:', data.serverTime, 'Client time:', Date.now())
      })

      eventSource.addEventListener('heartbeat', (event) => {
        console.log('💓 [LotteryEvents] Heartbeat received at', new Date().toISOString())
      })

      eventSource.addEventListener('draw-started', (event) => {
        try {
          console.log('🎲 [LotteryEvents] RAW draw-started event:', event.data)
          const data: DrawStartedEvent = JSON.parse(event.data)
          console.log('🎲 [LotteryEvents] PARSED draw-started:', data)
          console.log('🎲 [LotteryEvents] CALLING handler onDrawStarted')
          handlers.onDrawStarted?.(data)
        } catch (error) {
          console.error('Error parsing draw-started event:', error)
        }
      })

      eventSource.addEventListener('draw-completed', (event) => {
        try {
          console.log('✅ [LotteryEvents] RAW draw-completed event:', event.data)
          const data: DrawCompletedEvent = JSON.parse(event.data)
          console.log('✅ [LotteryEvents] PARSED draw-completed:', data)
          console.log('✅ [LotteryEvents] CALLING handler onDrawCompleted')
          handlers.onDrawCompleted?.(data)
        } catch (error) {
          console.error('Error parsing draw-completed event:', error)
        }
      })

      eventSource.addEventListener('numbers-drawn', (event) => {
        try {
          console.log('🎯 [LotteryEvents] RAW numbers-drawn event:', event.data)
          const data: NumbersDrawnEvent = JSON.parse(event.data)
          console.log('🎯 [LotteryEvents] PARSED numbers-drawn:', data)
          console.log('🎯 [LotteryEvents] CALLING handler onNumbersDrawn')
          handlers.onNumbersDrawn?.(data)
        } catch (error) {
          console.error('Error parsing numbers-drawn event:', error)
        }
      })

      eventSource.addEventListener('ticket-result', (event) => {
        try {
          console.log('🎫 [LotteryEvents] RAW ticket-result event:', event.data)
          const data: TicketResultEvent = JSON.parse(event.data)
          console.log('🎫 [LotteryEvents] PARSED ticket-result:', data)
          console.log('🎫 [LotteryEvents] CALLING handler onTicketResult')
          handlers.onTicketResult?.(data)
        } catch (error) {
          console.error('Error parsing ticket-result event:', error)
        }
      })

      eventSource.addEventListener('new-ticket', (event) => {
        try {
          console.log('🆕 [LotteryEvents] RAW new-ticket event:', event.data)
          const data: NewTicketEvent = JSON.parse(event.data)
          console.log('🆕 [LotteryEvents] PARSED new-ticket:', data)
          console.log('🆕 [LotteryEvents] CALLING handler onNewTicket')
          handlers.onNewTicket?.(data)
        } catch (error) {
          console.error('Error parsing new-ticket event:', error)
        }
      })

    } catch (error) {
      console.error('❌ [LotteryEvents] Failed to create EventSource:', error)
      handlers.onError?.('No se pudo conectar al servidor de eventos')
    }
  }, [handlers, connectionAttempts])

  const disconnect = useCallback(() => {
    console.log('🔌 [LotteryEvents] Disconnecting from event stream')
    
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    setConnectionAttempts(0)
    handlers.onConnectionChange?.(false)
  }, [handlers])

  // Conectar al montar el componente
  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, []) // Solo conectar una vez al montar, sin dependencias para evitar reconexiones

  return {
    isConnected,
    connectionAttempts,
    connect,
    disconnect
  }
}
