// filepath: /workspaces/lottery-neon-app/src/components/GameContent.tsx
'use client'
import { useState, useEffect } from 'react'
import NeonDisplay from '@/components/lottery/NeonDisplay'
import NumberInput from '@/components/lottery/NumberInput'
import PlayButton from '@/components/lottery/PlayButton'
import BackgroundEffect from '@/components/ui/BackgroundEffect'
import ShareButton from '@/components/ui/ShareButton'
import ONGSelector from '@/components/ong/ONGSelector'
import StartScreen from '@/components/ui/StartScreen'
import GovernancePanel from '@/components/governance/GovernancePanel'
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
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  
  const audioRef = useAudio()

  // 🔐 Usar Privy para autenticación real
  const { ready, authenticated, user, login, logout } = usePrivy()

  // 👤 Crear o obtener usuario cuando se autentique
  useEffect(() => {
    const createOrGetUser = async () => {
      if (authenticated && user?.wallet?.address && !currentUser && !isCreatingUser) {
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
    }
  }, [authenticated])

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
        100 // Default bet amount
      )

      if (!result.success) {
        setError(result.error || 'Error al realizar la apuesta')
        setIsPlaying(false)
        return
      }

      setBetResult(result)

      // After a delay, execute the draw
      setTimeout(async () => {
        try {
          const drawResult = await apiClient.executeDrawNumbers()
          
          if (drawResult.success && drawResult.winningNumbers) {
            setWinningNumbers(drawResult.winningNumbers)
            setIsPlaying(false)
            setHasPlayed(true)
            
            if (selectedNumbers === drawResult.winningNumbers) {
              audioRef.current?.playWinSound()
            } else {
              audioRef.current?.playLoseSound()
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

  // Mostrar panel de gobernanza
  if (showGovernance) {
    return (
      <GovernancePanel 
        userAddress={userAddress}
        onBack={handleHideGovernance}
      />
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

  return (
    <>
      <BackgroundEffect />
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        <button
          onClick={handleBackToONGSelection}
          className="absolute top-4 left-4 px-4 py-2 bg-gray-800 text-cyan-400 border border-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-all duration-300"
        >
          ← Cambiar ONG
        </button>

        {/* Botón de logout */}
        <button
          onClick={logout}
          className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
        >
          🔐 Desconectar
        </button>

        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="text-4xl mb-2">{selectedONG.icon}</div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">
              Jugando para: {selectedONG.name}
            </h2>
            <p className="text-sm text-gray-300 max-w-md mb-2">
              {selectedONG.mission}
            </p>
            <p className="text-xs text-gray-400">
              Usuario: {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
            </p>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <h1 className="text-6xl font-bold text-center mb-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            🎰 SUPER LOTERÍA 🎰
          </h1>
          
          <div className="mb-8">
            <NeonDisplay 
              selectedNumbers={selectedNumbers}
              winningNumbers={winningNumbers}
              isPlaying={isPlaying}
            />
            {error && (
              <p className="text-center text-red-400 mt-2 text-sm">
                ❌ {error}
              </p>
            )}
            {selectedNumbers.length === 4 && (
              <p className="text-center text-yellow-400 mt-2 text-sm">
                ✨ ¡Números seleccionados! Haz clic en JUGAR
              </p>
            )}
          </div>

          <div className="mb-8">
            <NumberInput 
              selectedNumbers={selectedNumbers}
              setSelectedNumbers={setSelectedNumbers}
              disabled={isPlaying || hasPlayed}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <PlayButton
              onClick={handlePlay}
              disabled={selectedNumbers.length !== 4 || isPlaying}
              isPlaying={isPlaying}
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
                  selectedONG={selectedONG}
                />
              </div>
            )}
          </div>
        </div>
      </div>
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
