'use client'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { ONG } from '@/lib/api-client'

const TicketContainer = styled(motion.div)`
  background: linear-gradient(145deg, #1a0033 0%, #330066 50%, #1a0033 100%);
  border: 3px solid #00ffff;
  border-radius: 20px;
  padding: 25px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff);
    border-radius: 20px;
    z-index: -1;
    animation: borderGlow 3s ease-in-out infinite alternate;
  }
    @keyframes borderGlow {
    0% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }
`

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
`

const TicketTitle = styled.h3`
  color: #00ffff;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-family: 'Orbitron', monospace;
`

const TicketId = styled.div`
  color: #888;
  font-size: 12px;
  font-family: monospace;
`

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`

const NumberSection = styled.div`
  text-align: center;
`

const SelectedNumber = styled(motion.div)`
  font-size: 48px;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  font-family: 'Orbitron', monospace;
  margin-bottom: 8px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #00ff00;
  border-radius: 15px;
`

const NumberLabel = styled.div`
  color: #00ffff;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const ONGSection = styled.div`
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
`

const ONGHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`

const ONGIcon = styled.div`
  font-size: 24px;
`

const ONGName = styled.div`
  color: #ffff00;
  font-weight: bold;
  font-size: 16px;
`

const ONGDescription = styled.div`
  color: #ccc;
  font-size: 12px;
  margin-bottom: 10px;
  line-height: 1.4;
`

const ContributionInfo = styled.div`
  background: rgba(255, 255, 0, 0.1);
  border: 1px solid rgba(255, 255, 0, 0.3);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
`

const ContributionAmount = styled.div`
  color: #ffff00;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`

const ContributionLabel = styled.div`
  color: #ccc;
  font-size: 12px;
`

const GameInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`

const InfoCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
`

const InfoValue = styled.div`
  color: #00ffff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
`

const InfoLabel = styled.div`
  color: #888;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ProgressSection = styled.div`
  margin-top: 15px;
`

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const ProgressLabel = styled.div`
  color: #00ffff;
  font-size: 14px;
  font-weight: bold;
`

const ProgressPercentage = styled.div`
  color: #ffff00;
  font-size: 12px;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 255, 0.3);
`

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #ff00ff, #00ffff);
  border-radius: 4px;
`

const StatusBadge = styled(motion.div)<{ status: 'waiting' | 'active' | 'completed' | 'pending' }>`
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  ${props => {
    switch (props.status) {
      case 'waiting':
        return `
          background: linear-gradient(45deg, #ffaa00, #ffcc00);
          color: #000;
        `;
      case 'active':
        return `
          background: linear-gradient(45deg, #00ff00, #88ff88);
          color: #000;
        `;
      case 'pending':
        return `
          background: linear-gradient(45deg, #ff8800, #ffaa00);
          color: #000;
          animation: pulse 2s ease-in-out infinite;
        `;
      case 'completed':
        return `
          background: linear-gradient(45deg, #0088ff, #00aaff);
          color: #fff;
        `;
      default:
        return `
          background: #666;
          color: #fff;
        `;
    }
  }}
`

interface TicketProps {
  ticketId: string
  selectedNumber: number
  selectedONG: ONG
  betAmount: string
  contributionAmount: string
  roundProgress: {
    totalSlots: number
    takenSlots: number
    minimumRequired: number
    timeRemaining?: string
  }
  status: 'waiting' | 'active' | 'completed' | 'pending'
  onCancel?: () => void
}

export default function Ticket({
  ticketId,
  selectedNumber,
  selectedONG,
  betAmount,
  contributionAmount,
  roundProgress,
  status,
  onCancel
}: TicketProps) {
  const progressPercentage = (roundProgress.takenSlots / roundProgress.totalSlots) * 100
  const canStartDraw = roundProgress.takenSlots >= roundProgress.minimumRequired
    const formatAmount = (amount: string) => {
    // Convertir de wei a ETH/MNT para display
    const eth = parseFloat(amount) / 1e18
    return eth.toFixed(4)
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'waiting':
        return '🎯 Listo para apostar'
      case 'active':
        return '🎲 Procesando apuesta...'
      case 'pending':
        return '⏳ Esperando resultados del sorteo...'
      case 'completed':
        return '✅ Sorteo completado'
      default:
        return '❓ Estado desconocido'
    }
  }

  return (
    <TicketContainer
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <StatusBadge
        status={status}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {getStatusText()}
      </StatusBadge>

      <TicketHeader>
        <div>
          <TicketTitle>🎫 Tu Ticket de Lotería</TicketTitle>
          <TicketId>ID: {ticketId}</TicketId>
        </div>
      </TicketHeader>

      <MainContent>
        <NumberSection>
          <SelectedNumber
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
          >
            {selectedNumber.toString().padStart(2, '0')}
          </SelectedNumber>
          <NumberLabel>Tu número de la suerte</NumberLabel>
        </NumberSection>

        <ONGSection>
          <ONGHeader>
            <ONGIcon>{selectedONG.icon}</ONGIcon>
            <ONGName>{selectedONG.name}</ONGName>
          </ONGHeader>
          <ONGDescription>{selectedONG.description}</ONGDescription>
          <ContributionInfo>
            <ContributionAmount>
              💝 +{formatAmount(contributionAmount)} MNT
            </ContributionAmount>
            <ContributionLabel>
              Contribución para {selectedONG.name}
            </ContributionLabel>
          </ContributionInfo>
        </ONGSection>
      </MainContent>

      <GameInfo>
        <InfoCard>
          <InfoValue>{formatAmount(betAmount)} MNT</InfoValue>
          <InfoLabel>Tu apuesta</InfoLabel>
        </InfoCard>
        <InfoCard>
          <InfoValue>{roundProgress.takenSlots}/{roundProgress.totalSlots}</InfoValue>
          <InfoLabel>Números tomados</InfoLabel>
        </InfoCard>
        <InfoCard>
          <InfoValue>{roundProgress.minimumRequired}</InfoValue>
          <InfoLabel>Mínimo requerido</InfoLabel>
        </InfoCard>
        {roundProgress.timeRemaining && (
          <InfoCard>
            <InfoValue>{roundProgress.timeRemaining}</InfoValue>
            <InfoLabel>Tiempo restante</InfoLabel>
          </InfoCard>
        )}
      </GameInfo>

      <ProgressSection>
        <ProgressHeader>
          <ProgressLabel>🚀 Progreso de la ronda</ProgressLabel>
          <ProgressPercentage>{progressPercentage.toFixed(1)}%</ProgressPercentage>
        </ProgressHeader>
        <ProgressBar>
          <ProgressFill
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </ProgressBar>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '8px',
          fontSize: '12px',
          color: '#888'
        }}>
          <span>0%</span>
          <span style={{ color: canStartDraw ? '#00ff00' : '#ffaa00' }}>
            {canStartDraw ? '✅ Listo para sorteo' : `⏳ ${roundProgress.minimumRequired - roundProgress.takenSlots} más necesarios`}
          </span>
          <span>100%</span>
        </div>
      </ProgressSection>

      {status === 'waiting' && onCancel && (
        <motion.button
          onClick={onCancel}
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            background: 'linear-gradient(45deg, #ff4444, #ff8888)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            padding: '8px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ❌ Cancelar
        </motion.button>
      )}
    </TicketContainer>
  )
}
