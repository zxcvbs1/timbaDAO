'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import TicketResults, { TicketResultsRef } from '@/components/lottery/TicketResults'
import NumberGrid from '@/components/lottery/NumberGrid'
import BackgroundEffect from '@/components/ui/BackgroundEffect'
// SSE Import removed - migrated to polling system

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
  font-size: 36px; // Reducido para mejor balance
  font-weight: bold;
  background: linear-gradient(45deg, #ff8800, #ffaa00, #ffcc00);
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(255, 136, 0, 0.4); // Sombra más sutil
  margin-bottom: 10px; // Reducido
  font-family: 'Orbitron', monospace;
`

const Subtitle = styled.p`
  color: #ffaa00;
  font-size: 16px; // Reducido
  margin-bottom: 15px; // Reducido
  font-family: 'Orbitron', monospace;
`

const WarningBanner = styled.div`
  background: rgba(255, 136, 0, 0.15); // Un poco más opaco
  border: 1px solid #ff8800; // Borde más fino
  border-radius: 8px; // Menos redondeado
  padding: 12px; // Ajustado
  color: #ffcc80; // Tono más claro
  font-family: 'Orbitron', monospace;
  font-size: 13px; // Reducido
  max-width: 700px; // Un poco más ancho
  margin: 0 auto 30px auto; // Margen inferior añadido
`

const TestingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; // Mantenido para dos columnas principales
  gap: 25px; // Espacio ligeramente reducido
  max-width: 1500px; // Aumentado para más espacio
  margin: 0 auto;

  @media (max-width: 1200px) { // Ajuste para tablets grandes
    grid-template-columns: 1fr;
    gap: 20px;
  }
`

const TestingSection = styled.div`
  background: rgba(0, 0, 0, 0.65); // Un poco más opaco
  border: 1px solid #ffaa00; // Borde más sutil, color ajustado
  border-radius: 15px; // Redondez ajustada
  padding: 20px; // Padding ajustado
  backdrop-filter: blur(8px); // Blur ligeramente reducido
  display: flex; // Flex para mejor alineación interna
  flex-direction: column; // Elementos internos en columna
`

const SectionTitle = styled.h2`
  color: #ffc966; // Tono más claro y vibrante
  font-size: 22px; // Ligeramente reducido
  margin-bottom: 15px;
  text-align: center;
  font-family: 'Orbitron', monospace;
  border-bottom: 1px solid #ffaa00; // Línea divisoria sutil
  padding-bottom: 10px; // Espacio para la línea
`

const SectionDescription = styled.p`
  color: #bbaacc; // Color suave para descripciones
  font-size: 13px;
  font-family: 'Arial', sans-serif; // Fuente más legible para texto largo
  margin-bottom: 15px;
  text-align: center;
  line-height: 1.5;
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
  font-size: 13px; // Ligeramente más pequeño
  font-family: 'Orbitron', monospace;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.45); // Un poco más opaco
  border-radius: 6px; // Menos redondeado
  text-align: center;
  border: 1px solid #555; // Borde sutil
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
      }    } catch {
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
        🔙 VOLVER AL JUEGO
      </BackButton>

      <Header>
        <Title>🔧 PANEL DE PRUEBAS Y SIMULACIÓN 🔧</Title>
        <Subtitle>Sistema de Lotería (Números Únicos 0-99) - Entorno de Desarrollo</Subtitle>
        
        <WarningBanner>
          ⚠️ <strong>ATENCIÓN:</strong> Este panel es exclusivamente para desarrollo y pruebas. Las acciones aquí pueden afectar el estado simulado del juego.
        </WarningBanner>
      </Header>

      <TestingGrid>
        {/* Columna Izquierda: Simulación de Jugadores y Números Tomados */}
        <TestingSection>
          <SectionTitle>🎭 Simulación de Jugadores</SectionTitle>          <SectionDescription>
            Esta sección permite simular la acción de un jugador realizando apuestas. 
            Selecciona uno o varios números en la parrilla de abajo y luego haz clic en &quot;Simular Apuesta de Jugador&quot;.
            Esto creará un usuario y una apuesta simulada para los números elegidos, marcándolos como &quot;tomados&quot;.
          </SectionDescription>
          
          {/* Number Grid para seleccionar números para simular apuesta */}
          <div style={{ marginBottom: '20px' }}>
            <InfoText>
              Números seleccionados para simular apuesta: {selectedNumbers.length > 0 ? selectedNumbers.map(n => n.toString().padStart(2, '0')).join(', ') : 'Ninguno'}
              <br />
              Total de números ya tomados en el sistema: {totalTaken} / 100
            </InfoText>            <NumberGrid
              onNumberSelect={handleSelectNumber}
              selectedNumber={null}
              disabled={isSimulatingPlayer}
              takenNumbers={takenNumbers}
              roundProgress={{ totalSlots: 100, takenSlots: 0 }}
            />
          </div>

          <ExecuteButton
            onClick={handleSimulatePlayer}
            disabled={isSimulatingPlayer || selectedNumbers.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSimulatingPlayer ? 'Simulando Apuesta...' : 'Simular Apuesta de Jugador'}
          </ExecuteButton>
          {error && error.includes('Jugador simulado creado') && <InfoText style={{ color: '#00ff00', marginTop: '10px' }}>{error}</InfoText>}
          {error && error.includes('Error') && <InfoText style={{ color: '#ff4444', marginTop: '10px' }}>{error}</InfoText>}
        </TestingSection>

        {/* Columna Derecha: Control de Sorteos y Resultados */}
        <TestingSection>
          <SectionTitle>⚙️ Control Manual de Sorteos</SectionTitle>
          <SectionDescription>
            Aquí puedes forzar la ejecución de un sorteo. Elige un modo:
            <ul>
              <li><strong>Sorteo Aleatorio:</strong> El sistema elige un número ganador al azar.</li>
              <li><strong>Forzar Victoria:</strong> El número ganador será el primer número que hayas seleccionado en la parrilla de la izquierda (para simular apuesta). Debes haber simulado una apuesta primero.</li>
              <li><strong>Forzar Derrota:</strong> El sistema elegirá un número ganador que NO esté entre los que seleccionaste para la apuesta simulada.</li>
              <li><strong>Número Específico:</strong> Ingresa manualmente el número que quieres que resulte ganador.</li>
            </ul>
          </SectionDescription>
          
          <ControlsGrid>
            <ModeButton isActive={testMode === 'random'} onClick={() => setTestMode('random')} disabled={isExecutingDraw}>Sorteo Aleatorio</ModeButton>
            <ModeButton isActive={testMode === 'win'} onClick={() => setTestMode('win')} disabled={isExecutingDraw || selectedNumbers.length === 0}>Forzar Victoria</ModeButton>
            <ModeButton isActive={testMode === 'lose'} onClick={() => setTestMode('lose')} disabled={isExecutingDraw || selectedNumbers.length === 0}>Forzar Derrota</ModeButton>
            <ModeButton isActive={testMode === 'specific'} onClick={() => setTestMode('specific')} disabled={isExecutingDraw}>Número Específico</ModeButton>
          </ControlsGrid>

          {testMode === 'specific' && (
            <NumberInput
              type="text"
              placeholder="Número ganador (0-99)"
              value={testNumber}
              onChange={(e) => handleTestNumberChange(e.target.value)}
              disabled={isExecutingDraw}
            />
          )}
          
          <InfoText>{getModeDescription()}</InfoText>

          <ExecuteButton
            onClick={handleExecuteDraw}
            disabled={isExecutingDraw || !canExecute()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExecutingDraw ? 'Ejecutando Sorteo...' : 'Ejecutar Sorteo Manual'}
          </ExecuteButton>
          {error && error.includes('Sorteo ejecutado') && <InfoText style={{ color: '#00ff00', marginTop: '10px' }}>{error}</InfoText>}
          {error && error.includes('Error en sorteo') && <InfoText style={{ color: '#ff4444', marginTop: '10px' }}>{error}</InfoText>}

          <div style={{ marginTop: '20px' }}>
            <SectionTitle>📊 Resultados Recientes (Testing)</SectionTitle>            <TicketResults 
              ref={ticketResultsRef} 
              userAddress={userAddress} // O un ID genérico si es para todos los resultados de testing
              autoRefresh={true}
              refreshInterval={5000} // Refrescar cada 5s
            />
          </div>
        </TestingSection>
      </TestingGrid>
      
      {/* Panel de Debug de SSE */}
      <TestingSection style={{ marginTop: '30px', gridColumn: '1 / -1' }}>
        <SectionTitle>📡 Monitor de Eventos del Servidor (SSE)</SectionTitle>
        <SectionDescription>
          Este panel muestra los eventos en tiempo real que el servidor envía al cliente. 
          Es útil para depurar la comunicación de sorteos, apuestas y resultados.
        </SectionDescription>
        {/* SSE Debug Panel - DISABLED (migrated to polling) */}
        <div style={{
          padding: '20px',
          background: 'rgba(128, 128, 128, 0.3)',
          borderRadius: '10px',
          textAlign: 'center',
          color: '#999'
        }}>
          <h3>📡 SSE Debug Panel</h3>
          <p>SSE System Disabled</p>
          <p>✅ Migrated to optimized polling system</p>
        </div>
      </TestingSection>

    </Container>
  )
}

// ...existing code...
// Actualizar la prop `selectedNumber` en NumberGrid para que acepte `number[] | null`
// y la prop `multiSelectNumbers` para manejar la selección múltiple visualmente.
// También añadir `isTestingPanel` para lógica condicional si es necesario.

// En NumberGrid.tsx:
// selectedNumber?: number | number[] | null; // Permitir array
// multiSelectNumbers?: number[]; // Para resaltar múltiples
// isTestingPanel?: boolean;

// Dentro del componente NumberGrid, ajustar la lógica de `isSelected`
// const isSelected = multiSelectNumbers ? multiSelectNumbers.includes(number) : selectedNumber === number;
// Y para `onNumberSelect`, si `isTestingPanel` es true y se permite selección múltiple,
// la lógica de `handleSelectNumber` en `TestingPanelUnified.tsx` ya maneja el array.
// Si `NumberGrid` se usa en el juego principal, `onNumberSelect` esperará un solo número.
// Esto requerirá asegurar que `onNumberSelect` en `GameContent.tsx` siga recibiendo un solo número.
// O, `NumberGrid` podría tener un prop `selectionMode: 'single' | 'multiple'`.

// Para `TicketResults.tsx`:
// Añadir prop opcional `isTestingPanelContext?: boolean`
// Si es true, quizás mostrar todos los tickets o filtrar de forma diferente.
