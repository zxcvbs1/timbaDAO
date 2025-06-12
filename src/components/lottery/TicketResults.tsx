'use client'
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
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
  font-family: 'Orbitron', monospace;
`

const Subtitle = styled.p`
  color: #888;
  font-size: 16px;
  margin-bottom: 20px;
`

const FilterTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`

const FilterTab = styled(motion.button)<{ active: boolean }>`
  padding: 10px 20px;
  border: 2px solid ${props => props.active ? '#00ffff' : '#666'};
  background: ${props => props.active ? 'rgba(0, 255, 255, 0.2)' : 'transparent'};
  color: ${props => props.active ? '#00ffff' : '#ccc'};
  border-radius: 20px;
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    color: #00ffff;
  }
`

const TicketsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`

const TicketCard = styled(motion.div)<{ status: string; isWinner?: boolean }>`
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid ${props => 
    props.isWinner ? '#00ff00' : 
    props.status === 'pending' ? '#ffff00' : 
    props.status === 'drawn' ? '#ff4444' : '#666'};
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => 
      props.isWinner ? '0 10px 30px rgba(0, 255, 0, 0.3)' : 
      props.status === 'pending' ? '0 10px 30px rgba(255, 255, 0, 0.3)' : 
      '0 10px 30px rgba(0, 255, 255, 0.2)'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => 
      props.isWinner ? 'linear-gradient(90deg, #00ff00, #88ff88)' : 
      props.status === 'pending' ? 'linear-gradient(90deg, #ffff00, #ff8800)' : 
      props.status === 'drawn' ? 'linear-gradient(90deg, #ff4444, #ff8888)' : 
      'linear-gradient(90deg, #666, #999)'};
  }
`

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const TicketId = styled.div`
  color: #00ffff;
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  font-weight: bold;
`

const TicketDate = styled.div`
  color: #888;
  font-size: 12px;
`

const StatusBadge = styled.div<{ status: string; isWinner?: boolean }>`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  font-family: 'Orbitron', monospace;
  background: ${props => 
    props.isWinner ? 'linear-gradient(45deg, #00ff00, #88ff88)' : 
    props.status === 'pending' ? 'linear-gradient(45deg, #ffff00, #ff8800)' : 
    props.status === 'drawn' ? 'linear-gradient(45deg, #ff4444, #ff8888)' : 
    'linear-gradient(45deg, #666, #999)'};
  color: ${props => props.isWinner || props.status === 'pending' ? '#000' : '#fff'};
  text-transform: uppercase;
`

const NumberSection = styled.div`
  text-align: center;
  margin: 20px 0;
`

const SelectedNumber = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #0066ff, #0088ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  font-family: 'Orbitron', monospace;
  margin: 0 auto 15px;
  box-shadow: 0 0 20px rgba(0, 102, 255, 0.4);
`

const WinningNumber = styled.div<{ isWinner: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.isWinner 
    ? 'linear-gradient(45deg, #00ff00, #88ff88)' 
    : 'linear-gradient(45deg, #ff4444, #ff8888)'};
  color: ${props => props.isWinner ? '#000' : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  font-family: 'Orbitron', monospace;
  margin: 0 auto;
  box-shadow: ${props => props.isWinner 
    ? '0 0 20px rgba(0, 255, 0, 0.4)' 
    : '0 0 20px rgba(255, 68, 68, 0.4)'};
`

const NumberLabel = styled.div`
  color: #00ffff;
  font-size: 14px;
  margin-bottom: 8px;
  font-family: 'Orbitron', monospace;
`

const TicketInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
`

const InfoItem = styled.div`
  background: rgba(0, 0, 0, 0.4);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.3);
`

const InfoLabel = styled.div`
  color: #00ffff;
  font-size: 12px;
  margin-bottom: 5px;
  font-family: 'Orbitron', monospace;
`

const InfoValue = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`

const ONGSection = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
`

const ONGName = styled.div`
  color: #00ffff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
`

const ONGContribution = styled.div`
  color: #00ff00;
  font-size: 14px;
  font-weight: bold;
`

const WinnerBadge = styled(motion.div)`
  position: absolute;
  top: -10px;
  left: -10px;
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #ffff00, #ff8800);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 10;
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.5);
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

const NoResults = styled.div`
  text-align: center;
  color: #666;
  font-size: 18px;
  padding: 40px;
`

// Interfaces
interface TicketResult {
  id: string
  ticketId: string
  playerAddress: string
  selectedNumber: number
  betAmount: string
  contributionAmount: string
  selectedONG: {
    id: string
    name: string
    logo?: string
  }
  playedAt: Date
  winningNumber?: number
  isWinner: boolean
  prizeAmount?: string
  drawId?: string
  status: 'pending' | 'drawn' | 'expired'
}

interface Props {
  maxResults?: number
  showHeader?: boolean
  userAddress?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface TicketResultsRef {
  forceRefresh: () => void
}

type FilterType = 'all' | 'user' | 'winners' | 'pending' | 'drawn'

const TicketResults = forwardRef<TicketResultsRef, Props>(({ 
  maxResults = 12, 
  showHeader = true, 
  userAddress,
  autoRefresh = true,
  refreshInterval = 5000
}, ref) => {
  const [results, setResults] = useState<TicketResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())

  // 🔄 Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log('🔄 [TicketResults] Auto-refreshing...')
      loadResults(true)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // 🔌 Exponer métodos via ref
  useImperativeHandle(ref, () => ({
    forceRefresh: () => loadResults(true)
  }), [])

  // 📦 Cargar resultados iniciales
  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async (reset = true) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentPage = reset ? 0 : page + 1
      const testUserAddress = userAddress || 'testuser@example.com'
      
      console.log('🎫 [TicketResults] Loading results:', { currentPage, userAddress: testUserAddress })
      
      const response = await fetch(`/api/lottery/results?page=${currentPage}&limit=${maxResults}&userAddress=${testUserAddress}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        if (reset) {
          setResults(data.results)
        } else {
          setResults(prev => [...prev, ...data.results])
        }
        setHasMore(data.hasMore)
        setPage(currentPage)
        setLastUpdateTime(Date.now())
      } else {
        setError(data.error || 'Error al cargar resultados')
      }
    } catch (err) {
      console.error('Error loading ticket results:', err)
      setError('Error de conexión al cargar resultados')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredResults = () => {
    switch (activeFilter) {
      case 'user':
        return results.filter(ticket => 
          userAddress && ticket.playerAddress.toLowerCase() === userAddress.toLowerCase()
        )
      case 'winners':
        return results.filter(ticket => ticket.isWinner)
      case 'pending':
        return results.filter(ticket => ticket.status === 'pending')
      case 'drawn':
        return results.filter(ticket => ticket.status === 'drawn')
      default:
        return results
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const formatAmount = (amount: string) => {
    const eth = parseFloat(amount) / 1e18
    return eth.toFixed(4)
  }

  const getStatusText = (status: string, isWinner: boolean) => {
    if (isWinner) return 'GANADOR'
    switch (status) {
      case 'pending': return 'PENDIENTE'
      case 'drawn': return 'SORTEADO'
      case 'expired': return 'EXPIRADO'
      default: return status.toUpperCase()
    }
  }

  const filteredResults = getFilteredResults()

  return (
    <Container>
      {showHeader && (
        <Header>
          <Title>🎫 Historial de Tickets</Title>
          <Subtitle>
            Sistema de números únicos (0-99) - Última actualización: {new Date(lastUpdateTime).toLocaleTimeString()}
          </Subtitle>
        </Header>
      )}

      {/* Filtros */}
      <FilterTabs>
        <FilterTab
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📋 Todos ({results.length})
        </FilterTab>
        {userAddress && (
          <FilterTab
            active={activeFilter === 'user'}
            onClick={() => setActiveFilter('user')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            👤 Mis Tickets ({results.filter(t => t.playerAddress.toLowerCase() === userAddress.toLowerCase()).length})
          </FilterTab>
        )}
        <FilterTab
          active={activeFilter === 'winners'}
          onClick={() => setActiveFilter('winners')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏆 Ganadores ({results.filter(t => t.isWinner).length})
        </FilterTab>
        <FilterTab
          active={activeFilter === 'pending'}
          onClick={() => setActiveFilter('pending')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⏳ Pendientes ({results.filter(t => t.status === 'pending').length})
        </FilterTab>
        <FilterTab
          active={activeFilter === 'drawn'}
          onClick={() => setActiveFilter('drawn')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎲 Sorteados ({results.filter(t => t.status === 'drawn').length})
        </FilterTab>
      </FilterTabs>

      {/* Error */}
      {error && (
        <NoResults>
          ❌ {error}
        </NoResults>
      )}

      {/* Loading */}
      {loading && results.length === 0 && (
        <NoResults>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            🎰
          </motion.div>
          Cargando tickets...
        </NoResults>
      )}

      {/* No results */}
      {filteredResults.length === 0 && !loading && !error && (
        <NoResults>
          📭 No hay tickets para mostrar
        </NoResults>
      )}

      {/* Tickets Grid */}
      <TicketsGrid>
        <AnimatePresence>
          {filteredResults.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              status={ticket.status}
              isWinner={ticket.isWinner}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Winner Badge */}
              {ticket.isWinner && (
                <WinnerBadge
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  👑
                </WinnerBadge>
              )}

              {/* Status Badge */}
              <StatusBadge status={ticket.status} isWinner={ticket.isWinner}>
                {getStatusText(ticket.status, ticket.isWinner)}
              </StatusBadge>

              {/* Header */}
              <TicketHeader>
                <TicketId>{ticket.ticketId}</TicketId>
                <TicketDate>{formatDate(ticket.playedAt)}</TicketDate>
              </TicketHeader>

              {/* Numbers */}
              <NumberSection>
                <NumberLabel>Tu número seleccionado</NumberLabel>
                <SelectedNumber>
                  {ticket.selectedNumber.toString().padStart(2, '0')}
                </SelectedNumber>
                
                {ticket.winningNumber !== undefined && (
                  <>
                    <NumberLabel style={{ marginTop: '15px' }}>
                      Número ganador
                    </NumberLabel>
                    <WinningNumber isWinner={ticket.isWinner}>
                      {ticket.winningNumber.toString().padStart(2, '0')}
                    </WinningNumber>
                  </>
                )}
              </NumberSection>

              {/* Ticket Info */}
              <TicketInfo>
                <InfoItem>
                  <InfoLabel>💰 Apuesta</InfoLabel>
                  <InfoValue>{formatAmount(ticket.betAmount)} ETH</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    {ticket.isWinner ? '🏆 Premio' : '🎯 Estado'}
                  </InfoLabel>
                  <InfoValue>
                    {ticket.isWinner && ticket.prizeAmount 
                      ? `${formatAmount(ticket.prizeAmount)} ETH`
                      : getStatusText(ticket.status, ticket.isWinner)
                    }
                  </InfoValue>
                </InfoItem>
              </TicketInfo>

              {/* ONG Section */}
              <ONGSection>
                <ONGName>🤝 {ticket.selectedONG.name}</ONGName>
                <ONGContribution>
                  +{formatAmount(ticket.contributionAmount)} ETH donados
                </ONGContribution>
              </ONGSection>

              {/* Player Info */}
              {userAddress && ticket.playerAddress.toLowerCase() === userAddress.toLowerCase() && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '10px', 
                  left: '10px', 
                  background: 'rgba(255, 255, 0, 0.2)',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  color: '#ffff00',
                  fontWeight: 'bold'
                }}>
                  👤 TU TICKET
                </div>
              )}
            </TicketCard>
          ))}
        </AnimatePresence>
      </TicketsGrid>

      {/* Load More */}
      {hasMore && filteredResults.length >= maxResults && (
        <LoadMoreButton
          onClick={() => loadResults(false)}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? '⏳ Cargando...' : '📄 Cargar Más Tickets'}
        </LoadMoreButton>
      )}
    </Container>
  )
})

TicketResults.displayName = 'TicketResults'

export default TicketResults
