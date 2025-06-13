// 📡 Componente de debugging para eventos SSE
// Permite probar y monitorear eventos en tiempo real

'use client'
import { useState } from 'react'
import styled from 'styled-components'
import { useLotteryEvents } from '@/hooks/useLotteryEvents'

const DebugContainer = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #ff8800;
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
`

const SectionTitle = styled.h3`
  color: #ffaa00;
  font-size: 20px;
  margin-bottom: 15px;
  text-align: center;
  font-family: 'Orbitron', monospace;
`

const TestButton = styled.button<{ disabled?: boolean }>`
  padding: 8px 12px;
  background: ${props => 
    props.disabled ? 'linear-gradient(45deg, #666, #888)' :
    'linear-gradient(45deg, #0066ff, #0088ff)'
  };
  border: none;
  border-radius: 8px;
  color: #fff;
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 11px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }
`

const StatusIndicator = styled.div<{ connected: boolean }>`
  background: ${props => props.connected ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 68, 68, 0.1)'};
  border: 2px solid ${props => props.connected ? '#00ff00' : '#ff4444'};
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  text-align: center;
  color: ${props => props.connected ? '#00ff00' : '#ff4444'};
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 14px;
`

const EventLog = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #666;
  border-radius: 8px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 10px;
`

const EventItem = styled.div<{ type: 'error' | 'success' | 'warning' | 'info' }>`
  color: ${props => {
    switch (props.type) {
      case 'error': return '#ff4444'
      case 'success': return '#00ff00'
      case 'warning': return '#ffaa00'
      default: return '#ccc'
    }
  }};
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  margin-bottom: 5px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  word-break: break-all;
`

export default function SSEDebugPanel() {
  const [isTestingSSE, setIsTestingSSE] = useState(false)
  const [sseEvents, setSSEEvents] = useState<string[]>([])
  const [lastEventTime, setLastEventTime] = useState<string>('')

  // SSE Event handlers for debugging
  const sseHandlers = {
    onDrawStarted: (event: any) => {
      const message = `🎲 DRAW_STARTED: ${event.drawId} (${event.participantCount} participants)`
      setSSEEvents(prev => [message, ...prev.slice(0, 9)])
      setLastEventTime(new Date().toISOString())
    },
    onDrawCompleted: (event: any) => {
      const message = `✅ DRAW_COMPLETED: ${event.drawId} - Numbers: ${event.winningNumbers} (${event.totalWinners}/${event.totalParticipants})`
      setSSEEvents(prev => [message, ...prev.slice(0, 9)])
      setLastEventTime(new Date().toISOString())
    },
    onNumbersDrawn: (event: any) => {
      const message = `🎯 NUMBERS_DRAWN: ${event.drawId} - ${event.numbers}`
      setSSEEvents(prev => [message, ...prev.slice(0, 9)])
      setLastEventTime(new Date().toISOString())
    },
    onTicketResult: (event: any) => {
      const message = `🎫 TICKET_RESULT: ${event.ticketId} - ${event.isWinner ? 'WIN' : 'LOSE'} (${event.userAddress})`
      setSSEEvents(prev => [message, ...prev.slice(0, 9)])
      setLastEventTime(new Date().toISOString())
    },
    onNewTicket: (event: any) => {
      const message = `🆕 NEW_TICKET: ${event.ticketId} - ${event.numbers} (${event.userAddress})`
      setSSEEvents(prev => [message, ...prev.slice(0, 9)])
      setLastEventTime(new Date().toISOString())
    },
    onConnectionChange: (connected: boolean) => {
      const message = `🔌 CONNECTION: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`
      setSSEEvents(prev => [message, ...prev.slice(0, 9)])
      setLastEventTime(new Date().toISOString())
    },
    onError: (error: string) => {
      const message = `❌ ERROR: ${error}`
      setSSEEvents(prev => [message, ...prev.slice(0, 9)])
      setLastEventTime(new Date().toISOString())
    }
  }

  const { isConnected, connectionAttempts } = useLotteryEvents(sseHandlers)

  const testEvent = async (eventType: string) => {
    setIsTestingSSE(true)
    try {
      const response = await fetch('/api/admin/test-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ Test event result:', result)
    } catch (error: any) {
      console.error('❌ Test event error:', error)
      setSSEEvents(prev => [`❌ TEST_ERROR: ${error.message}`, ...prev.slice(0, 9)])
    } finally {
      setIsTestingSSE(false)
    }
  }

  const clearEvents = () => {
    setSSEEvents([])
  }

  const getEventType = (event: string): 'error' | 'success' | 'warning' | 'info' => {
    if (event.startsWith('❌')) return 'error'
    if (event.startsWith('✅')) return 'success'
    if (event.startsWith('🔌')) return 'warning'
    return 'info'
  }

  return (
    <DebugContainer>
      <SectionTitle>📡 Testing de Eventos SSE</SectionTitle>
      
      {/* Connection Status */}
      <StatusIndicator connected={isConnected}>
        {isConnected ? '🟢 SSE CONECTADO' : '🔴 SSE DESCONECTADO'}
        {connectionAttempts > 0 && (
          <div style={{
            color: '#ffaa00',
            fontSize: '12px',
            marginTop: '5px'
          }}>
            Intentos: {connectionAttempts}
          </div>
        )}
      </StatusIndicator>

      {/* Test Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '10px'
      }}>
        <TestButton
          disabled={isTestingSSE}
          onClick={() => testEvent('draw-started')}
        >
          🎲 Draw Start
        </TestButton>
        <TestButton
          disabled={isTestingSSE}
          onClick={() => testEvent('numbers-drawn')}
        >
          🎯 Numbers
        </TestButton>
        <TestButton
          disabled={isTestingSSE}
          onClick={() => testEvent('ticket-result')}
        >
          🎫 Result
        </TestButton>
        <TestButton
          disabled={isTestingSSE}
          onClick={() => testEvent('draw-completed')}
        >
          ✅ Complete
        </TestButton>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '10px'
      }}>
        <TestButton
          disabled={isTestingSSE}
          onClick={() => testEvent('all-sequence')}
        >
          🔄 Full Sequence
        </TestButton>
        <TestButton
          disabled={false}
          onClick={clearEvents}
        >
          🗑️ Clear
        </TestButton>
      </div>

      {/* Events Log */}
      <EventLog>
        <div style={{
          color: '#ffaa00',
          fontFamily: 'Orbitron, monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          📡 Eventos Recibidos ({sseEvents.length})
        </div>
        
        {lastEventTime && (
          <div style={{
            color: '#888',
            fontFamily: 'Orbitron, monospace',
            fontSize: '10px',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            Último: {new Date(lastEventTime).toLocaleTimeString()}
          </div>
        )}

        {sseEvents.length === 0 ? (
          <div style={{
            color: '#666',
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            No hay eventos aún...
          </div>
        ) : (
          sseEvents.map((event, index) => (
            <EventItem key={index} type={getEventType(event)}>
              {event}
            </EventItem>
          ))
        )}
      </EventLog>

      <div style={{
        marginTop: '10px',
        padding: '8px',
        background: 'rgba(255, 136, 0, 0.1)',
        borderRadius: '5px',
        fontSize: '10px',
        color: '#ff8800',
        fontFamily: 'Orbitron, monospace',
        textAlign: 'center'
      }}>
        💡 Los eventos se envían a TODOS los clientes conectados
      </div>
    </DebugContainer>
  )
}
