import { EventEmitter } from 'events'

// Event emitter global para manejar eventos del sorteo
class LotteryEventEmitter extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(20) // Aumentar límite de listeners
    
    // Debug logging
    this.on('newListener', (event, listener) => {
      console.log(`📝 [EventEmitter] New listener added for event: ${event}`)
      console.log(`📊 [EventEmitter] Total listeners for ${event}:`, this.listenerCount(event))
    })
    
    this.on('removeListener', (event, listener) => {
      console.log(`🗑️ [EventEmitter] Listener removed for event: ${event}`)
      console.log(`📊 [EventEmitter] Remaining listeners for ${event}:`, this.listenerCount(event))
    })
  }
  
  emit(eventName: string | symbol, ...args: any[]): boolean {
    const eventStr = String(eventName)
    console.log(`📡 [EventEmitter] Emitting event: ${eventStr}`, args[0])
    console.log(`👥 [EventEmitter] Listeners for ${eventStr}:`, this.listenerCount(eventName))
    
    if (this.listenerCount(eventName) === 0) {
      console.warn(`⚠️ [EventEmitter] NO LISTENERS for event: ${eventStr}`)
    }
    
    const result = super.emit(eventName, ...args)
    console.log(`✅ [EventEmitter] Event ${eventStr} emission result:`, result)
    return result
  }
}

// Crear instancia única y global
export const lotteryEvents = new LotteryEventEmitter()

// Log when the module is loaded
console.log('🚀 [EventEmitter] Module loaded, instance created:', !!lotteryEvents)

// Tipos de eventos
export const LOTTERY_EVENTS = {
  DRAW_STARTED: 'draw_started',
  DRAW_COMPLETED: 'draw_completed',
  NUMBERS_DRAWN: 'numbers_drawn',
  TICKET_RESULT: 'ticket_result',
  NEW_TICKET: 'new_ticket'
} as const

export type LotteryEventType = typeof LOTTERY_EVENTS[keyof typeof LOTTERY_EVENTS]

// Tipos de datos para eventos
export interface DrawStartedEvent {
  drawId: string
  startTime: string
  estimatedDuration: number
}

export interface DrawCompletedEvent {
  drawId: string
  winningNumbers: string
  completedAt: string
  totalWinners: number
  totalParticipants: number
}

export interface NumbersDrawnEvent {
  drawId: string
  numbers: string
  timestamp: string
}

export interface TicketResultEvent {
  ticketId: string
  userAddress: string
  numbers: string
  isWinner: boolean
  drawId: string
}

export interface NewTicketEvent {
  ticketId: string
  userAddress: string
  numbers: string
  ongId: string
  timestamp: string
}
