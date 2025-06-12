// 🔥 NEW: Updated GameContent for single number (0-99) lottery system
'use client'
import { useState, useEffect, useRef } from 'react'
import NeonDisplay from '@/components/lottery/NeonDisplay'
import NumberGrid from '@/components/lottery/NumberGrid'
import Ticket from '@/components/lottery/Ticket'
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
  const [selectedNumbers, setSelectedNumbers] = useState<number | null>(null) // Single number 0-99
  const [isPlaying, setIsPlaying] = useState(false)
  const [winningNumbers, setWinningNumbers] = useState<number | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [betResult, setBetResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGovernance, setShowGovernance] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isExecutingDraw, setIsExecutingDraw] = useState(false)
  
  // 🔄 AUTO-REFRESH STATES
  const [shouldRefreshResults, setShouldRefreshResults] = useState(false)
  const [lastGameTimestamp, setLastGameTimestamp] = useState<number>(0)
  const drawResultsRef = useRef<DrawResultsRef>(null)
  
  // 🎯 TEST MODE STATES
  const [testMode, setTestMode] = useState<'normal' | 'win' | 'lose' | 'specific'>('normal')
  const [testNumbers, setTestNumbers] = useState<number | null>(null)
  
  const audioRef = useAudio()
  
  // 🔐 Privy authentication
  const { ready, authenticated, user, login, logout } = usePrivy()

  // 👤 User creation/retrieval
  const userCreationAttempted = useRef(false)
  
  useEffect(() => {
    const createOrGetUser = async () => {
      if (authenticated && user?.wallet?.address && !currentUser && !isCreatingUser && !userCreationAttempted.current) {
        userCreationAttempted.current = true
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

  // 🧹 Clear user on logout
  useEffect(() => {
    if (!authenticated) {
      setCurrentUser(null)
      setGameStarted(false)
      setSelectedONG(null)
      setSelectedNumbers(null)
      setError(null)
      userCreationAttempted.current = false
    }
  }, [authenticated])

  // 🔄 Auto-refresh results after games
  useEffect(() => {
    if (shouldRefreshResults && drawResultsRef.current?.forceRefresh) {
      console.log('🔄 [GameContent] Triggering results refresh after game completion')
      
      setTimeout(() => {
        drawResultsRef.current?.forceRefresh()
        setShouldRefreshResults(false)
      }, 1000)
    }
  }, [shouldRefreshResults])

  // Loading states
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
            🎰 TIMBADAO NEÓN 🎰
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>
            La lotería única 0-99 más solidaria
          </p>
          <p style={{ fontSize: '16px', marginBottom: '40px', color: '#ffff00' }}>
            🔐 Conéctate para jugar con números únicos
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

  const userAddress = user?.wallet?.address || user?.id || 'unknown'

  // Event handlers
  const handleStartGame = () => {
    setGameStarted(true)
    
    setTimeout(() => {
      audioRef.current?.setVolumeToMax()
      audioRef.current?.startBackgroundMusic()
    }, 500)
  }

  const handleSelectONG = (ong: ONG) => {
    setSelectedONG(ong)
    
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

  const handleSelectNumber = (number: number) => {
    setSelectedNumbers(number)
    setError(null)
  }

  const handlePlay = async () => {
    if (selectedNumbers === null || !selectedONG) return
    
    setIsPlaying(true)
    setHasPlayed(false)
    setError(null)
    
    audioRef.current?.playSlotSound()
    
    try {
      // Place bet with single number array
      const result = await apiClient.placeBet(
        userAddress,
        [selectedNumbers], // Convert to array for API compatibility
        selectedONG.id,
        1000000000000000000 // 1 MNT in wei
      )

      if (!result.success) {
        setError(result.error || 'Error al realizar la apuesta')
        setIsPlaying(false)
        return
      }

      setBetResult(result)

      // Execute draw automatically with test modes
      setTimeout(async () => {
        try {
          let winningNumbers: number[] | undefined

          if (process.env.NODE_ENV === 'development') {
            switch (testMode) {
              case 'win':
                winningNumbers = [selectedNumbers]
                break
              case 'lose':
                winningNumbers = [selectedNumbers === 99 ? 0 : selectedNumbers + 1]
                break
              case 'specific':
                if (testNumbers !== null) {
                  winningNumbers = [testNumbers]
                }
                break
              default:
                winningNumbers = undefined
            }
          }

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
            const finalWinningNumber = drawResult.result.winningNumbers[0]
            setWinningNumbers(finalWinningNumber)
            setIsPlaying(false)
            setHasPlayed(true)
            
            console.log('🎮 [GameContent] Game completed, triggering results refresh')
            setLastGameTimestamp(Date.now())
            setShouldRefreshResults(true)
            
            if (selectedNumbers === finalWinningNumber) {
              audioRef.current?.playWinSound()
            } else {
              audioRef.current?.playLoseSound()
            }

            if (process.env.NODE_ENV === 'development' && testMode !== 'normal') {
              const modeText = testMode === 'win' ? 'VICTORIA FORZADA' : 
                              testMode === 'lose' ? 'DERROTA FORZADA' : 
                              'NÚMEROS ESPECÍFICOS'
              setError(`🎯 ${modeText}: ${finalWinningNumber}. ${drawResult.result.winners.length} ganador(es)`)
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
    setSelectedNumbers(null)
    setWinningNumbers(null)
    setHasPlayed(false)
    setBetResult(null)
    setError(null)
  }

  const handleBackToONGSelection = () => {
    setSelectedONG(null)
    setSelectedNumbers(null)
    setWinningNumbers(null)
    setHasPlayed(false)
    setBetResult(null)
    setError(null)
  }

  const handleBackToStart = () => {
    setGameStarted(false)
    setSelectedONG(null)
    setSelectedNumbers(null)
    setWinningNumbers(null)
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
        const winNumbers = data.result.winningNumbers[0]
        setError(`✅ Sorteo ejecutado: ${winNumbers}. ${data.result.winners.length} ganador(es)`)
        
        console.log('🔧 [GameContent] Manual draw completed, triggering results refresh')
        setLastGameTimestamp(Date.now())
        setShouldRefreshResults(true)
      } else {
        setError(`❌ Error en sorteo: ${data.error}`)
      }
    } catch (error) {
      console.error('Error executing draw:', error)
      setError('❌ Error de conexión al ejecutar sorteo')
    } finally {
      setIsExecutingDraw(false)
    }
  }

  // Show governance panel
  if (showGovernance) {
    return (
      <GovernancePanel
        currentUser={currentUser}
        onBack={handleHideGovernance}
      />
    )
  }

  // Show results panel
  if (showResults) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)' }}>
        <BackgroundEffect />
        <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
          <button
            onClick={handleHideResults}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '10px 20px',
              background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔙 VOLVER
          </button>
          <DrawResults ref={drawResultsRef} />
        </div>
      </div>
    )
  }

  // Show start screen
  if (!gameStarted) {
    return (
      <StartScreen
        onStartGame={handleStartGame}
        onShowGovernance={handleShowGovernance}
        onShowResults={handleShowResults}
        currentUser={currentUser}
        onLogout={logout}
      />
    )
  }

  // Show ONG selection
  if (!selectedONG) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)' }}>
        <BackgroundEffect />
        <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
          <button
            onClick={handleBackToStart}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              padding: '10px 20px',
              background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔙 INICIO
          </button>
          <ONGSelector onSelectONG={handleSelectONG} />
        </div>
      </div>
    )
  }

  // Main game interface
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)' }}>
      <BackgroundEffect />
      
      <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
        {/* Header buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={handleBackToONGSelection}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔙 CAMBIAR ONG
          </button>

          <button
            onClick={handleShowResults}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(45deg, #ffff00, #ff00ff)',
              border: 'none',
              borderRadius: '10px',
              color: '#000',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📊 RESULTADOS
          </button>
        </div>

        {/* Game title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '48px',
            background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 30px rgba(255, 0, 255, 0.5)',
            fontFamily: 'Orbitron, monospace',
            marginBottom: '10px'
          }}>
            🎰 TIMBADAO NEÓN 🎰
          </h1>
          <p style={{
            color: '#00ffff',
            fontSize: '20px',
            fontFamily: 'Orbitron, monospace'
          }}>
            Apoyando a: <span style={{ color: '#ffff00' }}>{selectedONG.name}</span>
          </p>
        </div>

        {/* Game area */}
        <div id="game-area" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Number grid */}
          {!hasPlayed && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                textAlign: 'center',
                color: '#00ffff',
                fontSize: '24px',
                fontFamily: 'Orbitron, monospace',
                marginBottom: '20px'
              }}>
                🎯 Selecciona tu número único (0-99)
              </h2>
              <NumberGrid
                onNumberSelect={handleSelectNumber}
                selectedNumber={selectedNumbers}
                disabled={isPlaying}
                userId={userAddress}
              />
            </div>
          )}

          {/* Ticket display */}
          {selectedNumbers !== null && (
            <div style={{ marginBottom: '30px' }}>
              <Ticket
                selectedNumber={selectedNumbers}
                selectedONG={selectedONG}
                isPlaying={isPlaying}
                winningNumber={winningNumbers}
                isWinner={selectedNumbers === winningNumbers}
                betResult={betResult}
              />
            </div>
          )}

          {/* Play button */}
          {selectedNumbers !== null && !hasPlayed && (
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <PlayButton
                onClick={handlePlay}
                disabled={isPlaying}
              />
            </div>
          )}

          {/* Results display */}
          {hasPlayed && (
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              {selectedNumbers === winningNumbers ? (
                <div style={{
                  padding: '30px',
                  background: 'linear-gradient(45deg, #00ff00, #ffff00)',
                  borderRadius: '20px',
                  color: '#000',
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  🎉 ¡GANASTE! 🎉<br />
                  Número ganador: {winningNumbers}
                </div>
              ) : (
                <div style={{
                  padding: '30px',
                  background: 'linear-gradient(45deg, #ff0000, #ff6600)',
                  borderRadius: '20px',
                  color: '#fff',
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  😔 No ganaste esta vez<br />
                  Número ganador: {winningNumbers}<br />
                  Tu número: {selectedNumbers}
                </div>
              )}

              <button
                onClick={handleNewGame}
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
                  border: 'none',
                  borderRadius: '15px',
                  color: '#000',
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                🎲 NUEVO JUEGO
              </button>

              <ShareButton
                selectedNumbers={selectedNumbers.toString()}
                winningNumbers={winningNumbers?.toString() || ''}
                selectedONG={selectedONG}
                isWinner={selectedNumbers === winningNumbers}
              />
            </div>
          )}

          {/* Error display */}
          {error && (
            <div style={{
              textAlign: 'center',
              color: '#ff4444',
              background: 'rgba(255, 68, 68, 0.1)',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontFamily: 'Orbitron, monospace'
            }}>
              {error}
            </div>
          )}

          {/* Development tools */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '40px' }}>
              <TestModeSelection
                testMode={testMode}
                testNumbers={testNumbers?.toString() || ''}
                onTestModeChange={setTestMode}
                onTestNumbersChange={(nums) => setTestNumbers(parseInt(nums) || null)}
              />
              <AdminTestingPanel
                onExecuteDraw={handleExecuteDraw}
                isExecuting={isExecutingDraw}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GameContent() {
  return (
    <AudioProvider>
      <GameContentInner />
    </AudioProvider>
  )
}
