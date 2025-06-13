'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import TicketResults, { TicketResultsRef } from '@/components/lottery/TicketResults'
import NumberGrid from '@/components/lottery/NumberGrid'
import BackgroundEffect from '@/components/ui/BackgroundEffect'
import SSEDebugPanel from '@/components/ui/SSEDebugPanel'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%);
  padding: 20px;
`

const BackButton = styled(motion.button)`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  border: none;
  border-radius: 10px;
  color: #000;
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  cursor: pointer;
  z-index: 100;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(45deg, #ff8800, #ffaa00, #ffcc00);
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 30px rgba(255, 136, 0, 0.5);
  margin-bottom: 20px;
  font-family: 'Orbitron', monospace;
`

const Subtitle = styled.p`
  color: #ffaa00;
  font-size: 18px;
  margin-bottom: 20px;
  font-family: 'Orbitron', monospace;
`

const WarningBanner = styled.div`
  background: rgba(255, 136, 0, 0.1);
  border: 2px solid #ff8800;
  border-radius: 10px;
  padding: 15px;
  color: #ff8800;
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  max-width: 600px;
  margin: 0 auto;
`

const TestingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`

const TestingSection = styled.div`
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #ff8800;
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(10px);
`

const SectionTitle = styled.h2`
  color: #ffaa00;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Orbitron', monospace;
`

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const ModeButton = styled(motion.button)<{ isActive: boolean; disabled?: boolean }>`
  padding: 12px;
  background: ${props => 
    props.disabled ? 'linear-gradient(45deg, #666, #888)' :
    props.isActive ? 'linear-gradient(45deg, #00ff00, #88ff88)' : 
    'linear-gradient(45deg, #0066ff, #0088ff)'
  };
  border: none;
  border-radius: 10px;
  color: ${props => props.isActive ? '#000' : '#fff'};
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 12px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }
`

const NumberInput = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #666;
  border-radius: 8px;
  color: #fff;
  font-family: 'Orbitron', monospace;
  font-size: 16px;
  text-align: center;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #ffaa00;
    box-shadow: 0 0 10px rgba(255, 170, 0, 0.3);
  }
`

const ExecuteButton = styled(motion.button)<{ disabled: boolean }>`
  width: 100%;
  padding: 15px;
  background: ${props => 
    props.disabled ? 'linear-gradient(45deg, #666, #888)' :
    'linear-gradient(45deg, #ff4400, #ff6600)'
  };
  border: none;
  border-radius: 12px;
  color: #fff;
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  margin-top: 10px;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.02)'};
  }
`

const InfoText = styled.div`
  color: #ccc;
  font-size: 14px;
  font-family: 'Orbitron', monospace;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  text-align: center;
`

const StatsDisplay = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #666;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
`

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 12px;
  font-family: 'Orbitron', monospace;
`

interface Props {
  onBack: () => void
  userAddress: string
}

export default function TestingPanel({ onBack, userAddress }: Props) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]) // 🔥 CHANGED: Array para múltiples números
  const [isExecutingDraw, setIsExecutingDraw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testMode, setTestMode] = useState<'random' | 'win' | 'lose' | 'specific'>('random')
  const [testNumber, setTestNumber] = useState<string>('')
  const [takenNumbers, setTakenNumbers] = useState<number[]>([])
  const [totalTaken, setTotalTaken] = useState(0)
  const [isSimulatingPlayer, setIsSimulatingPlayer] = useState(false)
  
  const ticketResultsRef = useRef<TicketResultsRef>(null)

  // 🔄 Load taken numbers on mount and refresh periodically
  useEffect(() => {
    const loadTakenNumbers = async () => {
      try {
        const response = await fetch('/api/game/taken-numbers')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTakenNumbers(data.takenNumbers)
            setTotalTaken(data.totalTaken)
          }
        }
      } catch (error) {
        console.error('Error loading taken numbers:', error)
      }
    }

    loadTakenNumbers()
    
    // Refresh every 10 seconds
    const interval = setInterval(loadTakenNumbers, 10000)
    return () => clearInterval(interval)
  }, [])
  const handleSelectNumber = (number: number) => {
    if (number === -1) {
      // Limpiar todas las selecciones
      setSelectedNumbers([])
    } else {
      // Toggle del número: agregar si no está, quitar si ya está
      setSelectedNumbers(prev => {
        if (prev.includes(number)) {
          return prev.filter(n => n !== number)
        } else {
          return [...prev, number].sort((a, b) => a - b) // Mantener ordenado
        }
      })
    }
    setError(null)
  }

  const handleTestNumberChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '')
    const numValue = parseInt(cleanValue)
    if (cleanValue === '' || (numValue >= 0 && numValue <= 99)) {
      setTestNumber(cleanValue)
    }
  }
  const handleExecuteDraw = async () => {
    setIsExecutingDraw(true)
    setError(null)

    try {
      let winningNumbers: number[] | undefined

      switch (testMode) {
        case 'win':
          if (selectedNumbers.length > 0) {
            // Para modo win, usar el primer número seleccionado
            winningNumbers = [selectedNumbers[0]]
          }
          break
        case 'lose':
          if (selectedNumbers.length > 0) {
            // Para modo lose, usar un número que no esté en la selección
            const selectedSet = new Set(selectedNumbers)
            let loseNumber = 0
            while (selectedSet.has(loseNumber) && loseNumber < 100) {
              loseNumber++
            }
            winningNumbers = [loseNumber < 100 ? loseNumber : 99]
          }
          break
        case 'specific':
          if (testNumber !== '' && parseInt(testNumber) >= 0 && parseInt(testNumber) <= 99) {
            winningNumbers = [parseInt(testNumber)]
          }
          break
        default:
          winningNumbers = undefined
      }

      const requestBody = winningNumbers ? { winningNumbers } : {}
      
      const response = await fetch('/api/admin/execute-draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (data.success) {
        const winNumbers = data.result.winningNumbers[0]
        setError(`✅ Sorteo ejecutado: ${winNumbers}. ${data.result.winners.length} ganador(es)`)
        
        // Refresh results and taken numbers
        setTimeout(() => {
          ticketResultsRef.current?.forceRefresh()
          // Reload taken numbers
          fetch('/api/game/taken-numbers')
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setTakenNumbers(data.takenNumbers)
                setTotalTaken(data.totalTaken)
              }
            })
        }, 1000)
      } else {
        setError(`❌ Error en sorteo: ${data.error}`)
      }
    } catch (error) {
      console.error('Error executing draw:', error)
      setError('❌ Error de conexión al ejecutar sorteo')
    } finally {
      setIsExecutingDraw(false)    }
  }
  // 🎭 Función para simular un jugador real reservando números
  const handleSimulatePlayer = async () => {
    if (selectedNumbers.length === 0) {
      setError('❌ Selecciona al menos un número para simular el jugador')
      return
    }

    // Verificar que ningún número esté tomado
    const numbersAlreadyTaken = selectedNumbers.filter(num => takenNumbers.includes(num))
    if (numbersAlreadyTaken.length > 0) {
      setError(`❌ Números ya tomados: ${numbersAlreadyTaken.join(', ')}`)
      return
    }

    setIsSimulatingPlayer(true)
    setError(null)

    try {      // Generar un usuario simulado único
      const simulatedUserId = `simulated-player-${Date.now()}-${Math.random().toString(36).substring(7)}`
        // Crear el usuario simulado
      const userResult = await fetch('/api/users/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: simulatedUserId,
          email: `${simulatedUserId}@test.com`,
          name: `Jugador Simulado ${selectedNumbers.map(n => n.toString().padStart(2, '0')).join(',')}`
        })
      })

      const userData = await userResult.json()
      
      if (!userResult.ok || !userData.success) {
        throw new Error(`Error creando usuario: ${userData.error || userData.message || 'Unknown error'}`)
      }

      // Conseguir una ONG para la apuesta
      const ongResult = await fetch('/api/ongs/approved')
      const ongData = await ongResult.json()
      
      if (!ongData.success || !ongData.ongs?.length) {
        throw new Error('No hay ONGs disponibles')
      }      const selectedONG = ongData.ongs[0] // Usar la primera ONG

      // 🔥 NUEVO: Crear una apuesta separada por cada número seleccionado
      const successfulBets = []
      const failedBets = []

      for (const number of selectedNumbers) {
        try {
          const betResult = await fetch('/api/game/place-bet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: simulatedUserId,
              selectedNumbers: [number], // Solo un número por apuesta
              selectedOngId: selectedONG.id,
              betAmount: "1000000000000000000" // 1 MNT como string
            })
          })

          const betData = await betResult.json()
          
          if (betData.success) {
            successfulBets.push(number)
          } else {
            failedBets.push({ number, error: betData.error })
          }
        } catch (err) {
          failedBets.push({ number, error: 'Error de conexión' })
        }
      }
      
      // Mostrar resultado de todas las apuestas
      if (successfulBets.length > 0) {
        const successMessage = `✅ Jugador simulado creado: reservó ${successfulBets.length} número${successfulBets.length > 1 ? 's' : ''}: ${successfulBets.map(n => n.toString().padStart(2, '0')).join(', ')}`
        const failMessage = failedBets.length > 0 ? ` (${failedBets.length} fallaron)` : ''
        setError(successMessage + failMessage)
        
        // Refrescar números tomados inmediatamente
        setTimeout(() => {
          fetch('/api/game/taken-numbers')
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setTakenNumbers(data.takenNumbers)
                setTotalTaken(data.totalTaken)
              }
            })
        }, 500)

        // Limpiar selección
        setSelectedNumbers([])
      } else {
        setError(`❌ Error simulando jugador: Todas las apuestas fallaron`)
      }
    } catch (error) {
      console.error('Error simulating player:', error)
      setError('❌ Error de conexión al simular jugador')
    } finally {
      setIsSimulatingPlayer(false)
    }
  }

  const getModeDescription = () => {
    switch (testMode) {      case 'random':
        return '🎲 Sorteo aleatorio normal'
      case 'win':
        return selectedNumbers.length > 0
          ? `🏆 Usará tus números: ${selectedNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}` 
          : '🏆 Selecciona números primero'
      case 'lose':
        return selectedNumbers.length > 0
          ? `💔 Números diferentes (garantiza derrota)` 
          : '💔 Selecciona números primero'
      case 'specific':
        return testNumber !== '' && parseInt(testNumber) >= 0 && parseInt(testNumber) <= 99
          ? `🎯 Usará: ${testNumber.padStart(2, '0')}`
          : '🎯 Ingresa un número (0-99)'
      default:
        return ''
    }
  }
  const canExecute = () => {
    switch (testMode) {
      case 'win':
      case 'lose':
        return selectedNumbers.length > 0
      case 'specific':
        return testNumber !== '' && parseInt(testNumber) >= 0 && parseInt(testNumber) <= 99
      default:
        return true
    }
  }

  return (
    <Container>
      <BackgroundEffect />
      
      <BackButton
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔙 VOLVER
      </BackButton>

      <Header>
        <Title>🔧 PANEL DE TESTING UNIFICADO 🔧</Title>
        <Subtitle>Sistema de números únicos (0-99) - Modo Desarrollo</Subtitle>
        
        <WarningBanner>
          ⚠️ SOLO PARA DESARROLLO - Panel único para controlar sorteos manualmente
        </WarningBanner>
      </Header>

      <TestingGrid>
        {/* Left Column - Controls and Number Grid */}
        <div>
          <TestingSection>
            <SectionTitle>🎯 Selección de Número y Controles</SectionTitle>
            
            {/* Number Grid with taken numbers */}
            <div style={{ marginBottom: '20px' }}>              <NumberGrid
                onNumberSelect={handleSelectNumber}
                selectedNumber={selectedNumbers.length > 0 ? selectedNumbers[selectedNumbers.length - 1] : null}
                disabled={false}
                takenNumbers={takenNumbers}
                roundProgress={{
                  totalSlots: 100,
                  takenSlots: totalTaken,
                  timeRemaining: '∞'
                }}
              />
            </div>

            {/* Statistics */}
            <StatsDisplay>
              <StatItem>
                <span>📊 Números tomados:</span>
                <span>{totalTaken}/100</span>
              </StatItem>
              <StatItem>
                <span>📈 Disponibles:</span>
                <span>{100 - totalTaken}/100</span>
              </StatItem>              <StatItem>
                <span>🎯 Tu selección:</span>
                <span>{selectedNumbers.length > 0 ? selectedNumbers.map(n => n.toString().padStart(2, '0')).join(', ') : 'Ninguno'}</span>
              </StatItem>
            </StatsDisplay>

            {/* Testing Mode Selection */}
            <SectionTitle>🎮 Modo de Testing</SectionTitle>
            
            <ControlsGrid>
              <ModeButton
                isActive={testMode === 'random'}
                onClick={() => setTestMode('random')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎲 Aleatorio
              </ModeButton>
                <ModeButton
                isActive={testMode === 'win'}
                disabled={selectedNumbers.length === 0}
                onClick={() => setTestMode('win')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🏆 Forzar Victoria
              </ModeButton>
              
              <ModeButton
                isActive={testMode === 'lose'}
                disabled={selectedNumbers.length === 0}
                onClick={() => setTestMode('lose')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                💔 Forzar Derrota
              </ModeButton>
              
              <ModeButton
                isActive={testMode === 'specific'}
                onClick={() => setTestMode('specific')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎯 Específico
              </ModeButton>
            </ControlsGrid>

            {/* Specific number input */}
            {testMode === 'specific' && (
              <div style={{ marginBottom: '15px' }}>
                <NumberInput
                  type="text"
                  value={testNumber}
                  onChange={(e) => handleTestNumberChange(e.target.value)}
                  placeholder="Número ganador (0-99)"
                  maxLength={2}
                />
              </div>
            )}

            {/* Mode description */}
            <InfoText>
              {getModeDescription()}
            </InfoText>            {/* Execute button */}
            <ExecuteButton
              disabled={isExecutingDraw || !canExecute()}
              onClick={handleExecuteDraw}
              whileHover={{ scale: canExecute() && !isExecutingDraw ? 1.02 : 1 }}
              whileTap={{ scale: canExecute() && !isExecutingDraw ? 0.98 : 1 }}
            >
              {isExecutingDraw ? '⏳ Ejecutando...' : '🎲 Ejecutar Sorteo Controlado'}
            </ExecuteButton>            {/* Simulate Player button */}
            <ExecuteButton
              disabled={isSimulatingPlayer || selectedNumbers.length === 0 || selectedNumbers.some(num => takenNumbers.includes(num))}
              onClick={handleSimulatePlayer}
              whileHover={{ scale: !isSimulatingPlayer && selectedNumbers.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: !isSimulatingPlayer && selectedNumbers.length > 0 ? 0.98 : 1 }}
              style={{ 
                background: isSimulatingPlayer || selectedNumbers.length === 0 || selectedNumbers.some(num => takenNumbers.includes(num))
                  ? 'linear-gradient(45deg, #666, #888)'
                  : 'linear-gradient(45deg, #ff8800, #ffaa00)',
                marginTop: '10px'
              }}
            >
              {isSimulatingPlayer ? '⏳ Simulando...' : '🎭 Simular Jugadores (Reservar Números)'}
            </ExecuteButton>

            {/* Error/Success message */}
            {error && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: error.startsWith('✅') 
                  ? 'rgba(0, 255, 0, 0.1)' 
                  : 'rgba(255, 68, 68, 0.1)',
                border: `2px solid ${error.startsWith('✅') ? '#00ff00' : '#ff4444'}`,
                borderRadius: '10px',
                color: error.startsWith('✅') ? '#00ff00' : '#ff4444',
                fontFamily: 'Orbitron, monospace',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
          </TestingSection>
        </div>

        {/* Right Column - Results */}
        <div>
          <TestingSection>
            <SectionTitle>📊 Resultados en Tiempo Real</SectionTitle>
            <TicketResults 
              ref={ticketResultsRef}
              userAddress={userAddress}
              autoRefresh={true}
              refreshInterval={3000}
              maxResults={8}
              showHeader={false}
            />
          </TestingSection>

          {/* SSE Debugging Section */}
          <div style={{ marginTop: '20px' }}>
            <SSEDebugPanel />
          </div>
        </div>
      </TestingGrid>

      {/* Instructions */}
      <div style={{
        maxWidth: '800px',
        margin: '40px auto 0',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid #666',
        borderRadius: '15px',
        color: '#ccc',
        fontSize: '14px',
        fontFamily: 'Orbitron, monospace'
      }}>        <h3 style={{ color: '#ffaa00', marginBottom: '15px' }}>📋 Instrucciones del Panel Unificado:</h3>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Observa números tomados:</strong> Los números en rojo ya están ocupados por otros jugadores</li>
          <li><strong>Selecciona un número:</strong> Haz clic en cualquier número disponible (0-99)</li>
          <li><strong>🎭 Simular Jugador:</strong> Reserva el número seleccionado como si fuera otro jugador real</li>
          <li><strong>Elige modo de testing:</strong> Aleatorio, Forzar Victoria, Forzar Derrota, o Específico</li>
          <li><strong>Ejecuta sorteo:</strong> Presiona el botón para ejecutar el sorteo controlado</li>
          <li><strong>Observa resultados:</strong> Los tickets aparecen en tiempo real en el panel derecho</li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 136, 0, 0.1)', borderRadius: '5px' }}>
          <strong>🎯 Nuevo:</strong> Panel único y unificado - ¡ahora puedes simular jugadores reales que reservan números!
        </div>
        
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 68, 0, 0.1)', borderRadius: '5px' }}>
          <strong>🎭 Simulación de Jugadores:</strong> Los números reservados se bloquean en tiempo real para todos los usuarios, simulando perfectamente el comportamiento del juego real.
        </div>
      </div>
    </Container>
  )
}
