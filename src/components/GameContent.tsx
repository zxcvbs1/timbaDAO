// 🔥 NEW: Updated GameContent for single number (0-99) lottery system
'use client'
import { useState, useEffect, useRef } from 'react'
import NeonDisplay from '@/components/lottery/NeonDisplay'
import NumberGrid from '@/components/lottery/NumberGrid'
import Ticket from '@/components/lottery/Ticket'
import PlayButton from '@/components/lottery/PlayButton'
import DrawResults, { DrawResultsRef } from '@/components/lottery/DrawResults'
import TicketResults, { TicketResultsRef } from '@/components/lottery/TicketResults'
import BackgroundEffect from '@/components/ui/BackgroundEffect'
import ShareButton from '@/components/ui/ShareButton'
import ONGSelector from '@/components/ong/ONGSelector'
import StartScreen from '@/components/ui/StartScreen'
import GovernancePanel from '@/components/governance/GovernancePanel'
import TestingPanelUnified from '@/components/ui/TestingPanelUnified'
import { AudioProvider, useAudio } from '@/contexts/AudioContext'
import { apiClient, ONG, User } from '@/lib/api-client'
import { usePrivy } from '@privy-io/react-auth'
import { useLotteryEvents } from '@/hooks/useLotteryEvents'

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
  const [showTesting, setShowTesting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isExecutingDraw, setIsExecutingDraw] = useState(false)
  
  // 🔢 TAKEN NUMBERS STATE (for main game)
  const [takenNumbers, setTakenNumbers] = useState<number[]>([])
  const [totalTaken, setTotalTaken] = useState(0)
    // 🔄 AUTO-REFRESH STATES
  const [shouldRefreshResults, setShouldRefreshResults] = useState(false)
  const [lastGameTimestamp, setLastGameTimestamp] = useState<number>(0)
  const drawResultsRef = useRef<DrawResultsRef>(null)
  const ticketResultsRef = useRef<TicketResultsRef>(null)
  
  // 🎫 PENDING TICKETS STATE (for real-time updates)
  const [hasPendingTickets, setHasPendingTickets] = useState(false)
  const [lastDrawCheck, setLastDrawCheck] = useState<number>(0)
  
  // 🎯 TEST MODE STATES
  const [testMode, setTestMode] = useState<'normal' | 'win' | 'lose' | 'specific'>('normal')
  const [testNumbers, setTestNumbers] = useState<number | null>(null)
  
  // 🎯 REAL-TIME EVENTS STATE
  const [isEventConnected, setIsEventConnected] = useState(false)
  const [lastEventMessage, setLastEventMessage] = useState<string>('')
  const [currentDrawId, setCurrentDrawId] = useState<string | null>(null) // Nuevo: tracking de sorteo actual
  const [userTicketDrawId, setUserTicketDrawId] = useState<string | null>(null) // Nuevo: ID del sorteo del ticket del usuario
  
  const audioRef = useAudio()
  
  // 🔢 Función para cargar números tomados
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
  
  // 🎯 REAL-TIME EVENTS HANDLERS
  const lotteryEventHandlers = {
    onDrawStarted: (event: any) => {
      console.log('🎲 [GameContent] Draw started:', event)
      setLastEventMessage(`🎲 Sorteo iniciado: ${event.drawId}`)
      setCurrentDrawId(event.drawId) // Trackear el sorteo actual
      setIsExecutingDraw(true)
      audioRef.current?.playSlotSound()
    },
    
    onDrawCompleted: (event: any) => {
      console.log('✅ [GameContent] Draw completed:', event)
      setLastEventMessage(`✅ Sorteo ${event.drawId} completado! Números: ${event.winningNumbers}`)
      setIsExecutingDraw(false)
      setWinningNumbers(parseInt(event.winningNumbers))
      
      // Solo procesar si es el sorteo relevante para el usuario
      if (hasPendingTickets && event.drawId === currentDrawId) {
        console.log('🎫 [GameContent] Processing draw completion for user ticket')
        // Los resultados específicos del usuario llegaran via onTicketResult
      }
      
      // Refrescar resultados automáticamente
      setTimeout(() => {
        drawResultsRef.current?.forceRefresh()
        ticketResultsRef.current?.forceRefresh()
        setShouldRefreshResults(true)
      }, 1000)
      
      audioRef.current?.startBackgroundMusic()
    },
    
    onNumbersDrawn: (event: any) => {
      console.log('🎯 [GameContent] Numbers drawn:', event)
      setLastEventMessage(`🎯 Sorteo ${event.drawId}: Números sorteados: ${event.numbers}`)
      setWinningNumbers(parseInt(event.numbers))
    },
    
    onTicketResult: (event: any) => {
      console.log('🎫 [GameContent] Ticket result received!:', event)
      console.log('🎫 [GameContent] Current user:', currentUser?.id)
      console.log('🎫 [GameContent] Event user address:', event.userAddress)
      console.log('🎫 [GameContent] Event draw ID:', event.drawId)
      console.log('🎫 [GameContent] Current draw ID:', currentDrawId)
      console.log('🎫 [GameContent] User ticket draw ID:', userTicketDrawId)
      console.log('🎫 [GameContent] Match?:', currentUser && event.userAddress === currentUser.id)
      
      const isCurrentUser = currentUser && event.userAddress === currentUser.id
      const isRelevantDraw = event.drawId === currentDrawId || event.drawId === userTicketDrawId
      
      if (isCurrentUser && isRelevantDraw) {
        console.log('🎯 [GameContent] ✅ PROCESSING ticket result for current user:', {
          ticketId: event.ticketId,
          isWinner: event.isWinner,
          selectedNumbers,
          drawnNumbers: event.numbers,
          drawId: event.drawId
        })
        
        // Actualizar estado del juego
        setHasPendingTickets(false)
        setWinningNumbers(parseInt(event.numbers))
        setUserTicketDrawId(null) // Reset del tracking
        
        // Mostrar resultado y reproducir sonido
        const resultMessage = event.isWinner 
          ? '🎉 ¡GANASTE! ¡Felicidades!' 
          : '😔 No ganaste esta vez, ¡sigue intentando!'
          
        setLastEventMessage(`${resultMessage} (Sorteo: ${event.drawId})`)
        setError(resultMessage)
        
        if (event.isWinner) {
          audioRef.current?.playWinSound()
        } else {
          audioRef.current?.playLoseSound()
        }
        
        // Refrescar resultados inmediatamente
        setTimeout(() => {
          drawResultsRef.current?.forceRefresh()
          ticketResultsRef.current?.forceRefresh()
        }, 500)
      } else {
        console.log('🎫 [GameContent] ❌ NOT for current user or irrelevant draw, ignoring:', {
          isCurrentUser,
          isRelevantDraw,
          eventDrawId: event.drawId,
          currentDrawId,
          userTicketDrawId
        })
      }
    },
    
    onNewTicket: (event: any) => {
      console.log('🆕 [GameContent] New ticket:', event)
      // Actualizar números tomados cuando alguien más juega
      loadTakenNumbers()
    },
    
    onConnectionChange: (connected: boolean) => {
      setIsEventConnected(connected)
      setLastEventMessage(
        connected 
          ? '🔌 Conectado a eventos en tiempo real' 
          : '⚠️ Desconectado de eventos en tiempo real'
      )
    },
    
    onError: (error: string) => {
      console.error('❌ [GameContent] Event error:', error)
      setLastEventMessage(`❌ Error: ${error}`)
    }
  }
  
  // 🎯 INICIALIZAR EVENTOS EN TIEMPO REAL
  const { isConnected: eventStreamConnected } = useLotteryEvents(lotteryEventHandlers)
  
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
    }  }, [authenticated])
  
  // 🔢 Load taken numbers for main game
  useEffect(() => {
    // Load on mount and refresh every 10 seconds if game is started
    if (gameStarted) {
      loadTakenNumbers()
      const interval = setInterval(loadTakenNumbers, 10000)
      return () => clearInterval(interval)
    }
  }, [gameStarted])
  // 🎫 Real-time polling for users with pending tickets
  useEffect(() => {
    if (!authenticated || !currentUser || !gameStarted) return

    const checkForPendingTicketsAndDraws = async () => {
      try {
        // Check if user has pending tickets
        const ticketsResponse = await fetch(`/api/lottery/results?userAddress=${encodeURIComponent(currentUser.id)}&limit=10`)
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json()
          if (ticketsData.success && ticketsData.results) {
            // Check for pending tickets (tickets without winning numbers)
            const pendingTickets = ticketsData.results.filter((ticket: any) => 
              ticket.winningNumbers === null || ticket.winningNumbers === ''
            )
            
            // Check for recently completed tickets (within last 30 seconds)
            const recentlyCompleted = ticketsData.results.filter((ticket: any) => 
              ticket.winningNumbers !== null && ticket.winningNumbers !== '' &&
              ticket.confirmedAt && 
              new Date(ticket.confirmedAt).getTime() > Date.now() - 30000 // Last 30 seconds
            )
            
            const hasPending = pendingTickets.length > 0
            setHasPendingTickets(hasPending)

            console.log(`🎫 [GameContent] Pendientes: ${pendingTickets.length}, Recientes: ${recentlyCompleted.length}`)

            // If user had pending tickets and now has recently completed ones, refresh everything
            if (recentlyCompleted.length > 0 && (hasPlayed || hasPendingTickets)) {
              console.log('🎉 [GameContent] ¡Sorteo completado detectado! Actualizando resultados...')
              
              // Refresh all components
              drawResultsRef.current?.forceRefresh()
              ticketResultsRef.current?.forceRefresh()
              
              // Update game state
              setHasPlayed(true)
              
              // Check if user won in the recent draws
              const userWon = recentlyCompleted.some((ticket: any) => ticket.isWinner)
              if (userWon) {
                console.log('🏆 [GameContent] ¡Usuario ganó!')
                setWinningNumbers(recentlyCompleted[0].winningNumbers)
                audioRef.current?.playWinSound()
                setError('🎉 ¡Felicidades! ¡Has ganado el sorteo!')
              } else {
                console.log('💔 [GameContent] Usuario no ganó')
                setWinningNumbers(recentlyCompleted[0].winningNumbers)
                audioRef.current?.playLoseSound()
                setError('😔 No ganaste esta vez, ¡pero puedes intentar de nuevo!')
              }
              
              // Clear pending state
              setIsPlaying(false)
            }
          }
        }
      } catch (error) {
        console.error('Error checking pending tickets:', error)
      }
    }

    // Always check if game is started and user is authenticated
    if (gameStarted && currentUser) {
      checkForPendingTicketsAndDraws()
      
      // More frequent polling if user has pending tickets or has played recently
      const pollInterval = (hasPlayed || hasPendingTickets) ? 3000 : 10000 // 3s vs 10s
      const interval = setInterval(checkForPendingTicketsAndDraws, pollInterval)
      return () => clearInterval(interval)
    }
  }, [authenticated, currentUser, gameStarted, hasPlayed, hasPendingTickets])

  // 🔄 Auto-refresh results after games
  useEffect(() => {
    if (shouldRefreshResults && (drawResultsRef.current?.forceRefresh || ticketResultsRef.current?.forceRefresh)) {
      console.log('🔄 [GameContent] Triggering results refresh after game completion')
      
      setTimeout(() => {
        drawResultsRef.current?.forceRefresh()
        ticketResultsRef.current?.forceRefresh()
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
      }      setBetResult(result)
      setIsPlaying(false)
      setHasPlayed(true)
      setHasPendingTickets(true) // Force polling to start immediately

      // 🎯 NEW: Solo mostrar que la apuesta fue exitosa, NO ejecutar sorteo automático
      setError(`🎯 ¡Apuesta registrada! Tu número: ${selectedNumbers}. Esperando sorteo...`)
      
      // Refrescar resultados para mostrar la nueva apuesta pendiente
      console.log('🎮 [GameContent] Bet placed, triggering results refresh and polling')
      setLastGameTimestamp(Date.now())
      setShouldRefreshResults(true)
      
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
        
        // 🎯 NEW: Update local game state if player has a pending bet
        if (hasPlayed && winningNumbers === null) {
          setWinningNumbers(winNumbers)
          
          // Play appropriate sound based on result
          if (selectedNumbers === winNumbers) {
            audioRef.current?.playWinSound()
          } else {
            audioRef.current?.playLoseSound()
          }
        }
        
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

  const handleShowTesting = () => {
    setShowTesting(true)
  }

  const handleHideTesting = () => {
    setShowTesting(false)
  }

  // Show governance panel
  if (showGovernance) {
    return (      <GovernancePanel
        userAddress={userAddress}
        onBack={handleHideGovernance}
      />
    )
  }
  // Show testing panel
  if (showTesting) {
    return (
      <TestingPanelUnified
        userAddress={userAddress}
        onBack={handleHideTesting}
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
            }}          >
            🔙 VOLVER
          </button>
          <TicketResults 
            ref={ticketResultsRef} 
            userAddress={userAddress}
            autoRefresh={true}
            refreshInterval={5000}
          />
        </div>
      </div>
    )
  }

  // Show start screen
  if (!gameStarted) {
    return (      <StartScreen
        onStartGame={handleStartGame}
        onShowGovernance={handleShowGovernance}
        onShowResults={handleShowResults}
        onShowTesting={handleShowTesting}
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
            }}          >
            🔙 INICIO
          </button>
          <ONGSelector 
            onSelectONG={handleSelectONG} 
            onShowGovernance={handleShowGovernance}
          />
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
          
          {/* Real-time connection status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '15px',
            fontSize: '14px',
            fontFamily: 'Orbitron, monospace'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              background: isEventConnected 
                ? 'rgba(0, 255, 0, 0.1)' 
                : 'rgba(255, 165, 0, 0.1)',
              border: `1px solid ${isEventConnected ? '#00ff00' : '#ffa500'}`,
              borderRadius: '20px',
              color: isEventConnected ? '#00ff00' : '#ffa500'
            }}>
              <span style={{ 
                marginRight: '8px',
                animation: isEventConnected ? 'none' : 'pulse 2s infinite'
              }}>
                {isEventConnected ? '🟢' : '🟡'}
              </span>
              {isEventConnected ? 'Eventos en tiempo real' : 'Conectando eventos...'}
            </div>
          </div>
          
          {/* Event message */}
          {lastEventMessage && (
            <div style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: 'rgba(0, 255, 255, 0.1)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '10px',
              color: '#00ffff',
              fontSize: '12px',
              fontFamily: 'Orbitron, monospace',
              textAlign: 'center'
            }}>
              {lastEventMessage}
            </div>
          )}
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
              </h2>              <NumberGrid
                onNumberSelect={handleSelectNumber}
                selectedNumber={selectedNumbers}
                disabled={isPlaying}
                takenNumbers={takenNumbers}
                roundProgress={{
                  totalSlots: 100,
                  takenSlots: totalTaken,
                  timeRemaining: '∞'
                }}
              />
            </div>
          )}

          {/* Ticket display */}
          {selectedNumbers !== null && (
            <div style={{ marginBottom: '30px' }}>              <Ticket
                ticketId={`ticket-${Date.now()}`}
                selectedNumber={selectedNumbers!}
                selectedONG={selectedONG!}
                betAmount="0.01"
                contributionAmount="0.0015"
                roundProgress={{
                  totalSlots: 100,
                  takenSlots: 0,
                  minimumRequired: 3,
                  timeRemaining: '∞'
                }}
                status={isPlaying ? 'active' : (hasPendingTickets ? 'pending' : 'waiting')}
                onCancel={() => setSelectedNumbers(null)}
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
          )}          {/* 🎯 ESTADO DEL TICKET - Mostrar diferentes estados del sorteo */}
          {hasPlayed && winningNumbers === null && (
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                padding: '30px',
                background: isExecutingDraw 
                  ? 'linear-gradient(45deg, #ff6600, #ffaa00)' 
                  : 'linear-gradient(45deg, #ffa500, #ffff00)',
                borderRadius: '20px',
                color: '#000',
                fontFamily: 'Orbitron, monospace',
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '20px',
                border: `3px solid ${isExecutingDraw ? '#ff6600' : '#ffa500'}`,
                boxShadow: `0 0 20px ${isExecutingDraw ? 'rgba(255, 102, 0, 0.5)' : 'rgba(255, 165, 0, 0.5)'}`,
                transform: isExecutingDraw ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>
                {isExecutingDraw ? (
                  <>
                    🎲 SORTEO EN PROGRESO 🎲<br />
                    <div style={{ fontSize: '18px', marginTop: '10px' }}>
                      Ejecutando sorteo para tu número: <span style={{ fontSize: '28px', color: '#ff0000' }}>{selectedNumbers}</span>
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '10px', color: '#444' }}>
                      ¡Los números se están sorteando ahora mismo!
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      marginTop: '8px', 
                      color: '#ff0000',
                      animation: 'pulse 1s infinite'
                    }}>
                      🎯 Procesando resultados...
                    </div>
                  </>
                ) : (
                  <>
                    ⏳ APUESTA PENDIENTE ⏳<br />
                    <div style={{ fontSize: '18px', marginTop: '10px' }}>
                      Tu número: <span style={{ fontSize: '28px', color: '#ff6600' }}>{selectedNumbers}</span>
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                      Esperando que el administrador ejecute el sorteo...
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      marginTop: '8px', 
                      color: isEventConnected ? '#00ff00' : '#ff8800',
                      animation: 'pulse 2s infinite'
                    }}>
                      {isEventConnected 
                        ? '🔄 Conectado - Recibirás notificación automática' 
                        : '⚠️ Desconectado - Verificando manualmente...'
                      }
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleNewGame}
                disabled={isExecutingDraw}
                style={{
                  padding: '15px 30px',
                  background: isExecutingDraw 
                    ? 'linear-gradient(45deg, #666, #999)'
                    : 'linear-gradient(45deg, #ff00ff, #00ffff)',
                  border: 'none',
                  borderRadius: '15px',
                  color: isExecutingDraw ? '#ccc' : '#000',
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: isExecutingDraw ? 'not-allowed' : 'pointer',
                  opacity: isExecutingDraw ? 0.5 : 1,
                  marginRight: '10px'
                }}
              >
                🎲 NUEVA APUESTA
              </button>
            </div>
          )}

          {/* 🏆 Results display - only show when there's a winning number */}
          {hasPlayed && winningNumbers !== null && (
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
                selectedNumbers={selectedNumbers?.toString() || '0'}
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
              {error}            </div>
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
