'use client'
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'

const Container = styled.div`
  background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%);
  border-radius: 20px;
  padding: 30px;
  margin: 20px 0;
  border: 2px solid #666;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`

const Title = styled.h2`
  color: #00ffff;
  font-size: 28px;
  margin-bottom: 10px;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
`

const ResultCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #666;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  }
`

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`

const DrawNumber = styled.div`
  color: #ffff00;
  font-weight: bold;
  font-size: 18px;
`

const DrawDate = styled.div`
  color: #ccc;
  font-size: 14px;
`

const WinningNumbers = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
`

const NumberBall = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
`

const ResultStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`

const StatBox = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
`

const StatLabel = styled.div`
  color: #00ffff;
  font-size: 12px;
  margin-bottom: 5px;
`

const StatValue = styled.div`
  color: #fff;
  font-size: 20px;
  font-weight: bold;
`

const WinnerList = styled.div`
  margin-top: 20px;
`

const WinnerItem = styled.div`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  padding: 10px;
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const NoResults = styled.div`
  text-align: center;
  color: #666;
  font-size: 18px;
  padding: 40px;
`

const LoadMoreButton = styled(motion.button)`
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  border: none;
  border-radius: 15px;
  color: #000;
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 16px;
  padding: 15px 30px;
  cursor: pointer;
  margin: 20px auto;
  display: block;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const UserFeedbackContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'won',
})<{ won: boolean }>`
  background: ${props => props.won 
    ? 'linear-gradient(45deg, #00ff00, #ffff00)' 
    : 'linear-gradient(45deg, #ff4444, #ff8888)'};
  color: #000;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
  border: 3px solid ${props => props.won ? '#00ff00' : '#ff4444'};
  box-shadow: ${props => props.won 
    ? '0 0 30px rgba(0, 255, 0, 0.4)' 
    : '0 0 30px rgba(255, 68, 68, 0.4)'};
`

const NumberComparison = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
  flex-wrap: wrap;
`

const NumberSection = styled.div`
  text-align: center;
  flex: 1;
  min-width: 200px;
`

const SectionTitle = styled.div`
  color: #00ffff;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: bold;
`

const NumberRow = styled.div`
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-bottom: 5px;
`

const PositionLabels = styled.div`
  display: flex;
  gap: 5px;
  justify-content: center;
  margin-bottom: 10px;
  
  .position-label {
    width: 35px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #888;
    font-weight: bold;
  }
`

const UserNumberBall = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isMatch',
})<{ isMatch: boolean }>`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  background: ${props => props.isMatch 
    ? 'linear-gradient(45deg, #00ff00, #88ff88)' 
    : 'linear-gradient(45deg, #666, #999)'};
  color: ${props => props.isMatch ? '#000' : '#fff'};
  border: 2px solid ${props => props.isMatch ? '#00ff00' : '#666'};
  box-shadow: ${props => props.isMatch 
    ? '0 0 15px rgba(0, 255, 0, 0.5)' 
    : 'none'};
`

interface DrawResult {
  id: string
  drawNumber: number
  drawDate: Date
  winningNumbers: number[]
  totalBets: number
  totalPrizePool: string
  winners: {
    address: string
    prize: string
    numbersMatched: number
  }[]
  userParticipation?: {
    participated: boolean
    selectedNumbers: number[]
    numbersMatched: number
    betAmount: string
    won: boolean
    prizeWon: string
  }
  ongBeneficiary?: {
    name: string
    fundsReceived: string
  }
}

interface Props {
  maxResults?: number
  showHeader?: boolean
  userAddress?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface DrawResultsRef {
  forceRefresh: () => void
}

const DrawResults = forwardRef<DrawResultsRef, Props>(({ 
  maxResults = 5, 
  showHeader = true, 
  userAddress,
  autoRefresh = true,
  refreshInterval = 5000 // 5 segundos por defecto
}, ref) => {  const [results, setResults] = useState<DrawResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [lastKnownActivity, setLastKnownActivity] = useState<number>(0)
  useEffect(() => {
    loadResults()
    
    // Inicializar el timestamp de última actividad conocida
    const initializeActivity = async () => {
      try {
        const response = await fetch('/api/game/latest-activity')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const responseText = await response.text()
        if (!responseText.trim()) {
          throw new Error('Empty response from server')
        }
        
        let data
        try {
          data = JSON.parse(responseText)
        } catch (jsonError) {
          console.error('Invalid JSON response from latest-activity:', responseText)
          throw jsonError
        }
        
        if (data.success) {
          const latestActivity = Math.max(data.lastGameTime || 0, data.lastDrawTime || 0)
          setLastKnownActivity(latestActivity)
          console.log('🔄 [DrawResults] Initialized with latest activity:', new Date(latestActivity).toLocaleTimeString())
        }
      } catch (error) {
        console.error('Error initializing activity timestamp:', error)      }    }
    
    initializeActivity()
  }, [])

  // 🔄 AUTO-REFRESH: Actualizar resultados automáticamente
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      console.log('🔄 [DrawResults] Checking for new activity...');
      
      try {
        // Verificar la última actividad del juego
        const response = await fetch('/api/game/latest-activity')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const responseText = await response.text()
        if (!responseText.trim()) {
          throw new Error('Empty response from server')
        }
        
        let data
        try {
          data = JSON.parse(responseText)
        } catch (jsonError) {
          console.error('Invalid JSON response from latest-activity interval:', responseText)
          throw jsonError
        }
        
        if (data.success) {
          const latestActivity = Math.max(data.lastGameTime || 0, data.lastDrawTime || 0)
          
          // Solo recargar si hay actividad más reciente que la que conocemos
          if (latestActivity > lastKnownActivity) {
            console.log('🔄 [DrawResults] New activity detected, refreshing results...');
            console.log(`   Previous activity: ${new Date(lastKnownActivity).toLocaleTimeString()}`);            console.log(`   Latest activity: ${new Date(latestActivity).toLocaleTimeString()}`);
            
            loadResults(true);
            setLastKnownActivity(latestActivity);
          } else {
            console.log('🔄 [DrawResults] No new activity detected');
          }
        }
      } catch (error) {        console.error('Error checking activity:', error)
        // Si hay error, hacer refresh completo como fallback
        loadResults(true);
      }    }, refreshInterval);return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, userAddress, lastKnownActivity])
  // 🎯 MÉTODO PÚBLICO PARA FORZAR ACTUALIZACIÓN
  const forceRefresh = useCallback(() => {
    console.log('🔄 [DrawResults] Force refresh triggered');    loadResults(true);
  }, [])

  // 🔌 EXPONER MÉTODOS VIA REF
  useImperativeHandle(ref, () => ({
    forceRefresh
  }), [forceRefresh]);

  // Exponer método para que componentes padre puedan refrescar (fallback)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshDrawResults = forceRefresh;
    }
  }, [forceRefresh]);const loadResults = useCallback(async (reset = true) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentPage = reset ? 0 : page + 1
      
      // 🔥 USAR DIRECCIÓN DE PRUEBA SI NO HAY UNA CONECTADA
      const testUserAddress = userAddress || 'testuser@example.com';
      
      // 🔥 PASAR DIRECCIÓN DEL USUARIO A LA API
      console.log('🔍 [DrawResults] Loading results with userAddress:', testUserAddress);
      const response = await fetch(`/api/lottery/results?page=${currentPage}&limit=${maxResults}&userAddress=${testUserAddress}`)
      
      // 🛡️ VERIFICAR QUE LA RESPUESTA SEA VÁLIDA
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const responseText = await response.text()
      if (!responseText.trim()) {
        throw new Error('Empty response from server')
      }
      
      let data
      try {
        data = JSON.parse(responseText)      } catch {
        console.error('Invalid JSON response:', responseText)
        throw new Error('Invalid JSON response from server')
      }
      
      console.log('📊 [DrawResults] API Response:', data);
      
      if (data.success) {
        if (reset) {
          setResults(data.results)
        } else {
          setResults(prev => [...prev, ...data.results])
        }
        setHasMore(data.hasMore)
        setPage(currentPage)
      } else {
        setError(data.error || 'Error al cargar resultados')
      }
    } catch (err) {
      console.error('Error loading draw results:', err)
      setError('Error de conexión al cargar resultados')
      
      // Mock data para desarrollo - CON DIFERENTES FECHAS Y RESULTADOS
      const mockResults: DrawResult[] = [
        // Resultado más reciente (debería aparecer primero) - PERDEDOR
        {
          id: '3',
          drawNumber: 3,
          drawDate: new Date('2025-06-10T15:30:00'), // Más reciente
          winningNumbers: [9, 8, 7, 6],
          totalBets: 89,
          totalPrizePool: '8.9',
          winners: [
            {
              address: '0x9999...1111',
              prize: '4.5',
              numbersMatched: 4
            }
          ],
          userParticipation: userAddress ? {
            participated: true,
            selectedNumbers: [1, 2, 3, 4], // No coincide con ganadores
            numbersMatched: 0,
            betAmount: '0.1',
            won: false, // PERDEDOR
            prizeWon: '0'
          } : undefined,
          ongBeneficiary: {
            name: 'Cruz Roja',
            fundsReceived: '2.2'
          }
        },
        // Resultado intermedio - GANADOR
        {
          id: '2',
          drawNumber: 2,
          drawDate: new Date('2025-06-10T12:15:00'), // Intermedio
          winningNumbers: [1, 2, 3, 4],
          totalBets: 124,
          totalPrizePool: '12.4',
          winners: [
            {
              address: userAddress || '0x5555...6666',
              prize: '6.2',
              numbersMatched: 4
            }
          ],
          userParticipation: userAddress ? {
            participated: true,
            selectedNumbers: [1, 2, 3, 4], // Coincide perfectamente
            numbersMatched: 4,
            betAmount: '0.1',
            won: true, // GANADOR
            prizeWon: '6.2'
          } : undefined,
          ongBeneficiary: {
            name: 'Fundación Niños',
            fundsReceived: '3.1'
          }
        },
        // Resultado más antiguo - GANADOR
        {
          id: '1',
          drawNumber: 1,
          drawDate: new Date('2025-06-09T20:00:00'), // Más antiguo
          winningNumbers: [7, 3, 2, 1],
          totalBets: 156,
          totalPrizePool: '15.6',
          winners: [
            {
              address: '0x1234...5678',
              prize: '7.8',
              numbersMatched: 4
            }
          ],
          userParticipation: userAddress ? {
            participated: true,
            selectedNumbers: [7, 3, 9, 1], // Acertó 3 números (7, 3, 1)
            numbersMatched: 3,
            betAmount: '0.1',
            won: true, // GANADOR
            prizeWon: '2.5'
          } : undefined,
          ongBeneficiary: {
            name: 'Fundación Esperanza Verde',
            fundsReceived: '3.9'
          }
        }
      ]
      setResults(mockResults)    } finally {
      setLoading(false)
    }
  }, [userAddress, page, maxResults])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))  }

  const getUserPrize = (winners: DrawResult['winners']) => {
    if (!userAddress) return null
    return winners.find(w => w.address.toLowerCase() === userAddress.toLowerCase())
  }

  return (
    <Container>
      {showHeader && (
        <Header>
          <Title>🎲 Resultados de Sorteos 🎲</Title>
        </Header>
      )}

      {error && !results.length && (
        <NoResults>
          ❌ {error}
        </NoResults>
      )}

      {results.length === 0 && !loading && !error && (
        <NoResults>
          📭 No hay resultados de sorteos disponibles
        </NoResults>
      )}      

      <AnimatePresence>
        {results
          // 🔄 ORDENAR POR FECHA DESCENDENTE (MÁS RECIENTE PRIMERO)
          .sort((a, b) => {
            const dateA = new Date(a.drawDate).getTime()
            const dateB = new Date(b.drawDate).getTime()
            return dateB - dateA // Más reciente primero
          })        .map((result, index) => {
          const userParticipated = result.userParticipation?.participated
          
          return (
            <ResultCard
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{
                borderColor: userParticipated 
                  ? (result.userParticipation?.won ? '#00ff00' : '#ff4444')
                  : '#666',
                boxShadow: userParticipated 
                  ? (result.userParticipation?.won 
                    ? '0 0 20px rgba(0, 255, 0, 0.3)' 
                    : '0 0 20px rgba(255, 68, 68, 0.3)')
                  : 'none'
              }}
            >
              <ResultHeader>
                <DrawNumber>🎯 Sorteo #{result.drawNumber}</DrawNumber>
                <DrawDate>{formatDate(result.drawDate)}</DrawDate>
              </ResultHeader>

              {/* 🎱 NÚMEROS GANADORES */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ color: '#00ffff', fontSize: '16px', marginBottom: '10px' }}>
                  🎱 Números Ganadores
                </div>
                <WinningNumbers>
                  {result.winningNumbers.map((number, idx) => (
                    <NumberBall key={idx}>
                      {number}
                    </NumberBall>
                  ))}
                </WinningNumbers>
              </div>

              {/* 🎉 FEEDBACK PERSONALIZADO DEL USUARIO */}
              {userParticipated && (
                <UserFeedbackContainer
                  won={result.userParticipation?.won || false}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {result.userParticipation?.won ? (
                    <>
                      🎉 ¡FELICIDADES! ¡GANASTE! 🎉
                      <br />
                      <div style={{ fontSize: '18px', margin: '10px 0' }}>
                        Premio: {result.userParticipation.prizeWon} ETH
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        ({result.userParticipation.numbersMatched} números acertados)
                      </div>
                    </>
                  ) : (
                    <>
                      😔 No ganaste esta vez 😔
                      <br />
                      <div style={{ fontSize: '16px', margin: '10px 0' }}>
                        Acertaste {result.userParticipation?.numbersMatched || 0} números
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        Apuesta: {result.userParticipation?.betAmount} ETH
                      </div>
                    </>
                  )}                  {/* 🔢 COMPARACIÓN DE NÚMEROS */}
                  <NumberComparison>
                    <NumberSection>
                      <SectionTitle>Números Ganadores</SectionTitle>
                      <PositionLabels>
                        {result.winningNumbers.map((_, idx) => (
                          <div key={idx} className="position-label">Pos {idx + 1}</div>
                        ))}
                      </PositionLabels>
                      <NumberRow>
                        {result.winningNumbers.map((number, idx) => {
                          const userNumber = result.userParticipation?.selectedNumbers[idx]
                          const isMatch = userNumber === number
                          return (
                            <UserNumberBall key={idx} isMatch={isMatch}>
                              {number}
                            </UserNumberBall>
                          )
                        })}
                      </NumberRow>
                    </NumberSection>
                    
                    <NumberSection>
                      <SectionTitle>Tus Números</SectionTitle>
                      <PositionLabels>
                        {result.userParticipation?.selectedNumbers.map((_, idx) => (
                          <div key={idx} className="position-label">Pos {idx + 1}</div>
                        ))}
                      </PositionLabels>
                      <NumberRow>
                        {result.userParticipation?.selectedNumbers.map((number, idx) => {
                          // 🔥 VERIFICAR COINCIDENCIA POR POSICIÓN, NO SOLO SI APARECE EN LA LISTA
                          const isMatch = result.winningNumbers[idx] === number
                          return (
                            <UserNumberBall key={idx} isMatch={isMatch}>
                              {number}
                            </UserNumberBall>
                          )
                        })}
                      </NumberRow>
                    </NumberSection>
                  </NumberComparison>
                </UserFeedbackContainer>
              )}

              {/* 📊 ESTADÍSTICAS DEL SORTEO */}
              <ResultStats>
                <StatBox>
                  <StatLabel>💰 Pozo Total</StatLabel>
                  <StatValue>{result.totalPrizePool} ETH</StatValue>
                </StatBox>
                <StatBox>
                  <StatLabel>🎫 Total Apuestas</StatLabel>
                  <StatValue>{result.totalBets}</StatValue>
                </StatBox>
                <StatBox>
                  <StatLabel>🏆 Ganadores</StatLabel>
                  <StatValue>{result.winners.length}</StatValue>
                </StatBox>
                {result.ongBeneficiary && (
                  <StatBox>
                    <StatLabel>🤝 ONG Beneficiada</StatLabel>
                    <StatValue style={{ fontSize: '14px' }}>
                      {result.ongBeneficiary.name}
                      <br />
                      <span style={{ color: '#00ff00' }}>
                        +{result.ongBeneficiary.fundsReceived} ETH
                      </span>
                    </StatValue>
                  </StatBox>
                )}
              </ResultStats>

              {/* 🏆 LISTA DE GANADORES */}
              {result.winners.length > 0 && (
                <WinnerList>
                  <div style={{ color: '#00ffff', fontSize: '16px', marginBottom: '10px' }}>
                    🏆 Ganadores:
                  </div>
                  {result.winners.map((winner, idx) => (
                    <WinnerItem key={idx}>
                      <span>
                        👤 {formatAddress(winner.address)}
                        {winner.address.toLowerCase() === userAddress?.toLowerCase() && 
                          <span style={{ color: '#ffff00' }}> (TÚ)</span>
                        }
                      </span>
                      <span style={{ color: '#00ff00', fontWeight: 'bold' }}>
                        {winner.prize} ETH ({winner.numbersMatched} ✓)
                      </span>
                    </WinnerItem>
                  ))}
                </WinnerList>
              )}
            </ResultCard>
          )
        })}
      </AnimatePresence>

      {/* 📄 BOTÓN CARGAR MÁS */}
      {hasMore && results.length >= maxResults && (
        <LoadMoreButton
          onClick={() => loadResults(false)}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? '⏳ Cargando...' : '📄 Cargar Más Resultados'}
        </LoadMoreButton>
      )}

      {loading && results.length === 0 && (
        <NoResults>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            ⚡
          </motion.div>
          Cargando resultados...        </NoResults>
      )}
    </Container>
  )
})

DrawResults.displayName = 'DrawResults'

export default DrawResults
