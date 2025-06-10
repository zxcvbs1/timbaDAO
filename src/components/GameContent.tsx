// filepath: /workspaces/lottery-neon-app/src/components/GameContent.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import NeonDisplay from '@/components/lottery/NeonDisplay'
import NumberInput from '@/components/lottery/NumberInput'
import PlayButton from '@/components/lottery/PlayButton'
import DrawResults, { DrawResultsRef } from '@/components/lottery/DrawResults'
import BackgroundEffect from '@/components/ui/BackgroundEffect'
import ShareButton from '@/components/ui/ShareButton'
import ONGSelector from '@/components/ong/ONGSelector'
import StartScreen from '@/components/ui/StartScreen'
import GovernancePanel from '@/components/governance/GovernancePanel'
import AdminTestingPanel from '@/components/ui/AdminTestingPanel'
import TestModeSelection from '@/components/ui/TestModeSelection'
import { AudioProvider, useAudio } from '@/contexts/AudioContext'
import { apiClient, ONG, User } from '@/lib/api-client'
import { usePrivy } from '@privy-io/react-auth'

function GameContentInner() {
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedONG, setSelectedONG] = useState<ONG | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [winningNumbers, setWinningNumbers] = useState('')
  const [hasPlayed, setHasPlayed] = useState(false)
  const [betResult, setBetResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGovernance, setShowGovernance] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isExecutingDraw, setIsExecutingDraw] = useState(false)
    // 🔄 ESTADOS PARA AUTO-REFRESH DE RESULTADOS
  const [shouldRefreshResults, setShouldRefreshResults] = useState(false)
  const [lastGameTimestamp, setLastGameTimestamp] = useState<number>(0)
  const drawResultsRef = useRef<DrawResultsRef>(null)
  
  // 🎯 TEST MODE STATES
  const [testMode, setTestMode] = useState<'normal' | 'win' | 'lose' | 'specific'>('normal')
  const [testNumbers, setTestNumbers] = useState('')
  
  const audioRef = useAudio()
  
  // 🔐 Usar Privy para autenticación real
  const { ready, authenticated, user, login, logout } = usePrivy()

  // 👤 Crear o obtener usuario cuando se autentique
  const userCreationAttempted = useRef(false)
  
  useEffect(() => {
    const createOrGetUser = async () => {
      if (authenticated && user?.wallet?.address && !currentUser && !isCreatingUser && !userCreationAttempted.current) {
        userCreationAttempted.current = true // Marcar que ya intentamos crear el usuario
        setIsCreatingUser(true)
        
        try {
          const result = await apiClient.getOrCreateUser(
            user.wallet.address,
            user.email?.address,
            user.email?.address ? `User ${user.wallet.address.slice(0, 8)}...` : undefined
          )
          
          if (result.success && result.user) {
            setCurrentUser(result.user)
            console.log('✅ Usuario autenticado:', result.user.id, result.user.isNew ? '(nuevo)' : '(existente)')
          } else {
            setError(result.error || 'Error al crear usuario')
          }
        } catch (err) {
          setError('Error de conexión al autenticar usuario')
        } finally {
          setIsCreatingUser(false)
        }
      }
    }

    createOrGetUser()
  }, [authenticated, user?.wallet?.address, currentUser, isCreatingUser])

  // 🧹 Limpiar usuario cuando se desconecte
  useEffect(() => {
    if (!authenticated) {
      setCurrentUser(null)
      setGameStarted(false)
      setSelectedONG(null)
      setError(null)
      userCreationAttempted.current = false // Reset el flag cuando se desconecte
    }
  }, [authenticated])
  // 🔄 EFECTO PARA AUTO-REFRESH DESPUÉS DE JUEGOS
  useEffect(() => {
    if (shouldRefreshResults && drawResultsRef.current?.forceRefresh) {
      console.log('🔄 [GameContent] Triggering results refresh after game completion')
      
      // Esperar un momento para que la DB se actualice completamente
      setTimeout(() => {
        drawResultsRef.current?.forceRefresh()
        setShouldRefreshResults(false)
      }, 1000)
    }
  }, [shouldRefreshResults])

  // Si no está listo Privy, mostrar loading
  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00ffff',
        fontSize: '24px',
        fontFamily: 'Orbitron, monospace'
      }}>
        🔐 Inicializando autenticación... 🔐
      </div>
    )
  }

  // Si no está autenticado, mostrar pantalla de login
  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00ffff',
        fontSize: '24px',
        fontFamily: 'Orbitron, monospace',
        padding: '20px',
        textAlign: 'center'
      }}>
        <BackgroundEffect />
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 30px rgba(255, 0, 255, 0.5)'
          }}>
            🎰 SUPER LOTERÍA NEÓN 🎰
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>
            La lotería más solidaria del mundo
          </p>
          <p style={{ fontSize: '16px', marginBottom: '40px', color: '#ffff00' }}>
            🔐 Conéctate para jugar y participar en la governance
          </p>
        </div>
        
        <button
          onClick={login}
          style={{
            padding: '20px 40px',
            background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
            border: 'none',
            borderRadius: '15px',
            color: '#000',
            fontFamily: 'Orbitron, monospace',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🚀 CONECTAR WALLET
        </button>
      </div>
    )
  }

  // Si está autenticado pero aún creando usuario, mostrar loading
  if (authenticated && isCreatingUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00ffff',
        fontSize: '24px',
        fontFamily: 'Orbitron, monospace'
      }}>
        👤 Configurando tu cuenta... 👤
      </div>
    )
  }

  // Obtener la dirección del usuario autenticado
  const userAddress = user?.wallet?.address || user?.id || 'unknown'

  const handleStartGame = () => {
    setGameStarted(true)
    
    setTimeout(() => {
      audioRef.current?.setVolumeToMax()
      audioRef.current?.startBackgroundMusic()
    }, 500)
  }

  const handleSelectONG = (ong: ONG) => {
    setSelectedONG(ong)
    
    // 🎯 SCROLL AUTOMÁTICO AL ÁREA DE JUEGO
    setTimeout(() => {
      const gameArea = document.getElementById('game-area')
      if (gameArea) {
        gameArea.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 100)
  }

  const handlePlay = async () => {
    if (selectedNumbers.length !== 4 || !selectedONG) return
    
    setIsPlaying(true)
    setHasPlayed(false)
    setError(null)
    
    audioRef.current?.playSlotSound()
    
    try {
      // Place the bet using the API
      const result = await apiClient.placeBet(
        userAddress,
        selectedNumbers,
        selectedONG.id,
        1000000000000000000 // Default bet amount (1 MNT in wei)
      )

      if (!result.success) {
        setError(result.error || 'Error al realizar la apuesta')
        setIsPlaying(false)
        return
      }

      setBetResult(result)

      // 🎯 EJECUTAR SORTEO AUTOMÁTICAMENTE CON MODO DE TESTING
      setTimeout(async () => {
        try {
          let winningNumbers: number[] | undefined

          // Determinar números ganadores según el modo de testing
          if (process.env.NODE_ENV === 'development') {
            switch (testMode) {
              case 'win':
                winningNumbers = selectedNumbers.split('').map(Number)
                break
              case 'lose':
                const playerNumbers = selectedNumbers.split('').map(Number)
                winningNumbers = playerNumbers.map(num => num === 9 ? 0 : 9) // Números opuestos
                break
              case 'specific':
                if (testNumbers.length === 4) {
                  winningNumbers = testNumbers.split('').map(Number)
                }
                break
              default:
                // 'normal' - números aleatorios
                winningNumbers = undefined
            }
          }

          // Ejecutar sorteo con números controlados o aleatorios
          const requestBody = winningNumbers ? { winningNumbers } : {}
          
          const response = await fetch('/api/admin/execute-draw', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          })

          const drawResult = await response.json()
          
          if (drawResult.success && drawResult.result.winningNumbers) {
            const finalWinningNumbers = drawResult.result.winningNumbers.join('')
            setWinningNumbers(finalWinningNumbers)
            setIsPlaying(false)
            setHasPlayed(true)
            
            // 🔄 ACTIVAR AUTO-REFRESH DE RESULTADOS
            console.log('🎮 [GameContent] Game completed, triggering results refresh')
            setLastGameTimestamp(Date.now())
            setShouldRefreshResults(true)
            
            if (selectedNumbers === finalWinningNumbers) {
              audioRef.current?.playWinSound()
            } else {
              audioRef.current?.playLoseSound()
            }

            // Mostrar resultado del testing si está en modo desarrollo
            if (process.env.NODE_ENV === 'development' && testMode !== 'normal') {
              const modeText = testMode === 'win' ? 'VICTORIA FORZADA' : 
                              testMode === 'lose' ? 'DERROTA FORZADA' : 
                              'NÚMEROS ESPECÍFICOS'
              setError(`🎯 ${modeText}: ${finalWinningNumbers}. ${drawResult.result.winners.length} ganador(es)`)
            }
          } else {
            setError(drawResult.error || 'Error al ejecutar el sorteo')
            setIsPlaying(false)
          }
        } catch (err) {
          setError('Error de conexión al ejecutar el sorteo')
          setIsPlaying(false)
        }
      }, 3000)
      
    } catch (err) {
      setError('Error de conexión al realizar la apuesta')
      setIsPlaying(false)
    }
  }

  const handleNewGame = () => {
    setSelectedNumbers('')
    setWinningNumbers('')
    setHasPlayed(false)
    setBetResult(null)
    setError(null)
  }

  const handleBackToONGSelection = () => {
    setSelectedONG(null)
    setSelectedNumbers('')
    setWinningNumbers('')
    setHasPlayed(false)
    setBetResult(null)
    setError(null)
  }

  const handleBackToStart = () => {
    setGameStarted(false)
    setSelectedONG(null)
    setSelectedNumbers('')
    setWinningNumbers('')
    setHasPlayed(false)
    setBetResult(null)
    setError(null)
  }

  const handleShowGovernance = () => {
    setShowGovernance(true)
  }
  const handleHideGovernance = () => {
    setShowGovernance(false)
  }

  const handleShowResults = () => {
    setShowResults(true)
  }

  const handleHideResults = () => {
    setShowResults(false)
  }

  // 🎲 Función para ejecutar sorteo en desarrollo
  const handleExecuteDraw = async (specificNumbers?: number[]) => {
    if (process.env.NODE_ENV !== 'development') {
      setError('Solo disponible en modo desarrollo')
      return
    }

    setIsExecutingDraw(true)
    setError(null)

    try {
      const requestBody = specificNumbers ? { winningNumbers: specificNumbers } : {}
      
      const response = await fetch('/api/admin/execute-draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (data.success) {
        const winNumbers = data.result.winningNumbers.join('')
        setError(`✅ Sorteo ejecutado: ${winNumbers}. ${data.result.winners.length} ganador(es)`)
        
        // 🔄 ACTIVAR AUTO-REFRESH DE RESULTADOS TRAS SORTEO MANUAL
        console.log('🔧 [GameContent] Manual draw completed, triggering results refresh')
        setLastGameTimestamp(Date.now())
        setShouldRefreshResults(true)
        
        // Actualizar números ganadores en pantalla
        setWinningNumbers(winNumbers)
      } else {
        setError(`❌ Error en sorteo: ${data.error}`)
      }
    } catch (error) {
      console.error('Error executing draw:', error)
      setError('❌ Error ejecutando sorteo')
    } finally {
      setIsExecutingDraw(false)
    }
  }
  // Mostrar panel de gobernanza
  if (showGovernance) {
    return (
      <GovernancePanel 
        userAddress={userAddress}
        onBack={handleHideGovernance}
      />
    )
  }

  // Mostrar historial completo de resultados
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={handleHideResults}
            className="mb-6 px-6 py-3 bg-gray-800 text-cyan-400 border border-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-300"
          >
            ← Volver al Juego
          </button>
          
          <DrawResults 
            ref={drawResultsRef}
            maxResults={20}
            showHeader={true}
            userAddress={userAddress}
            autoRefresh={true}
            refreshInterval={3000}
          />
        </div>
      </div>
    )
  }

  // Pantalla de inicio
  if (!gameStarted) {
    return <StartScreen onStart={handleStartGame} />
  }

  // Selector de ONG
  if (!selectedONG) {
    return (
      <>
        <BackgroundEffect />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <button
            onClick={handleBackToStart}
            className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-cyan-400 border border-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-300"
          >
            ← Volver al inicio
          </button>
          
          {/* Botón de logout */}
          <button
            onClick={logout}
            className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            🔐 Desconectar
          </button>
          
          <ONGSelector onSelectONG={handleSelectONG} onShowGovernance={handleShowGovernance} />
        </div>
      </>
    )
  }

  // Pantalla principal del juego
  return (
    <>
      <BackgroundEffect />
      
      <main className="min-h-screen relative">
        {/* 🎮 BOTONES DE NAVEGACIÓN FIJOS */}
        <button
          onClick={handleBackToONGSelection}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
        >
          ← Cambiar ONG
        </button>
        
        <button
          onClick={logout}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
        >
          🔐 Desconectar
        </button>

        {/* 🏥 INFORMACIÓN DE ONG COMPACTA */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-cyan-400/30 py-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="text-2xl">{selectedONG.icon}</div>
              <div>
                <h2 className="text-lg font-bold text-cyan-400">
                  Jugando para: {selectedONG.name}
                </h2>
                <p className="text-xs text-gray-300">{selectedONG.mission}</p>
                <p className="text-xs text-gray-400">
                  Usuario: {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎮 ÁREA DE JUEGO PRINCIPAL - COMPLETAMENTE CENTRADA */}
        <div className="w-full flex justify-center">
          <div id="game-area" className="w-full max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-6xl font-bold text-center mb-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              🎰 SUPER LOTERÍA 🎰
            </h1>

            {/* 🚀 BOTONES DE NAVEGACIÓN RÁPIDA */}
            <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleShowResults}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              🎲 Ver Resultados
            </button>
            <button
              onClick={handleShowGovernance}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              🗳️ Governance
            </button>
          </div>
          
          <div className="mb-8">
            <NeonDisplay 
              numbers={selectedNumbers.split('')}
              color="cyan"
            />
            {error && (
              <p className="text-center text-red-400 mt-2 text-sm">
                ❌ {error}
              </p>
            )}
            {selectedNumbers.length === 4 && !hasPlayed && (
              <p className="text-center text-green-400 mt-2 text-sm animate-pulse">
                ✅ ¡Listo para jugar!
              </p>
            )}
          </div>

          <div className="mb-8">
            <NumberInput 
              value={selectedNumbers}
              onChange={setSelectedNumbers}
              disabled={isPlaying}
            />
          </div>

          <div className="w-full flex flex-col items-center gap-4">
            <PlayButton
              onClick={handlePlay}
              disabled={selectedNumbers.length !== 4 || isPlaying}
              isLoading={isPlaying}
            />
            
            {selectedNumbers.length !== 4 && !isPlaying && (
              <p className="text-center text-yellow-400 text-sm">
                Selecciona 4 números para jugar
              </p>
            )}

            {hasPlayed && (
              <div className="text-center">
                <button
                  onClick={handleNewGame}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 mb-4"
                >
                  🎲 Jugar de nuevo
                </button>
                <ShareButton 
                  selectedNumbers={selectedNumbers}
                  winningNumbers={winningNumbers}
                  isWinner={selectedNumbers === winningNumbers && hasPlayed}
                  selectedONG={selectedONG}
                />
              </div>
            )}

            <p className="text-center text-purple-300 text-sm mb-4">
              💝 15% de tu jugada va para {selectedONG.name} {selectedONG.icon}
              <br />
              ¡Cada participación cuenta!
            </p>

            {/* 🔧 PANEL DE INFORMACIÓN DE DESARROLLO */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 w-full max-w-lg">
                <TestModeSelection 
                  testMode={testMode}
                  onTestModeChange={setTestMode}
                  testNumbers={testNumbers}
                  onTestNumbersChange={setTestNumbers}
                  selectedNumbers={selectedNumbers}
                />
                
                <AdminTestingPanel 
                  onExecuteDraw={handleExecuteDraw}
                  isExecuting={isExecutingDraw}
                  selectedNumbers={selectedNumbers}
                />
              </div>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600 max-w-lg">
                <h3 className="text-yellow-400 text-sm font-bold mb-2">ℹ️ INFORMACIÓN DE DESARROLLO</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• El modo de testing se configura ANTES de hacer clic en JUGAR</p>
                  <p>• El sorteo se ejecuta automáticamente después de apostar</p>
                  <p>• Los resultados aparecen en el área de mensajes arriba</p>
                  <p>• Solo visible en modo desarrollo</p>
                </div>
              </div>
            )}

            {/* 🎲 RESULTADOS DE SORTEOS RECIENTES */}
            <div className="mt-12 w-full max-w-4xl">
              <DrawResults 
                ref={drawResultsRef}
                maxResults={3}
                showHeader={true}
                userAddress={userAddress}
                autoRefresh={true}
                refreshInterval={5000}
                key={lastGameTimestamp} // Forzar re-render cuando hay un nuevo juego
              />
            </div>
          </div>
        </div>
        </div>
      </main>
    </>
  )
}

export default function GameContent() {
  return (
    <AudioProvider>
      <GameContentInner />
    </AudioProvider>
  )
}
