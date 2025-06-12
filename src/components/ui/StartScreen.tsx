'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { usePrivy } from '@privy-io/react-auth'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Orbitron', monospace;
`

const MainTitle = styled(motion.h1)`
  font-size: clamp(48px, 8vw, 120px);
  font-weight: 900;
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff);
  background-size: 400% 400%;
  background-clip: text;
  color: transparent;
  animation: gradientShift 3s ease-in-out infinite;

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`

const Subtitle = styled(motion.p)`
  font-size: 24px;
  color: #00ffff;
  text-align: center;
  margin-bottom: 40px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
`

const StartButton = styled(motion.button)`
  background: linear-gradient(45deg, #ff0080, #ff4000);
  border: none;
  border-radius: 25px;
  padding: 20px 60px;
  color: white;
  font-size: 32px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 30px rgba(255, 0, 128, 0.6);
  text-transform: uppercase;
  letter-spacing: 3px;
  font-family: 'Orbitron', monospace;
  margin-bottom: 40px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Features = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 600px;
`

const FeatureCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);

  .icon { font-size: 32px; margin-bottom: 10px; }
  .title { color: #00ffff; font-size: 16px; font-weight: bold; margin-bottom: 8px; }
  .description { color: #ffffff; font-size: 12px; opacity: 0.8; }
`

const LoadingMessage = styled(motion.div)`
  color: #00ffff;
  font-size: 18px;
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`

const UserInfo = styled(motion.div)`
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px 25px;
  margin-bottom: 20px;
  text-align: center;
  color: #00ffff;
  font-size: 14px;
  
  .wallet-address {
    font-family: 'monospace';
    font-size: 12px;
    opacity: 0.7;
    margin-top: 5px;
  }
`

interface Props {
  onStartGame: () => void
  onShowGovernance?: () => void
  onShowResults?: () => void
  onShowTesting?: () => void
  currentUser?: any
  onLogout?: () => void
}

export default function StartScreen({ 
  onStartGame, 
  onShowGovernance, 
  onShowResults, 
  onShowTesting,
  currentUser,
  onLogout 
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const { ready, authenticated, user, login } = usePrivy()

  const handleStart = async () => {
    console.log('START GAME clicked!') // ✅ Debug
    
    if (!authenticated) {
      console.log('User not authenticated, opening login...')
      login()
      return
    }

    console.log('User authenticated:', user?.id)
    setIsLoading(true)
      setTimeout(() => {
      console.log('Calling onStartGame...') // ✅ Debug
      onStartGame()
    }, 2000)
  }

  // Show loading if Privy is not ready
  if (!ready) {
    return (
      <Container>
        <LoadingMessage
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🔐 Inicializando autenticación...
        </LoadingMessage>
      </Container>
    )
  }

  return (
    <Container>
      <MainTitle
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        🎰 SUPER LOTERÍA 🎰
      </MainTitle>

      <Subtitle
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        ¡Juega y ayuda a ONGs de todo el mundo!
      </Subtitle>

      <StartButton
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        whileHover={{ scale: isLoading ? 1 : 1.1 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        onClick={handleStart}
        disabled={isLoading}
      >
        {isLoading ? '🎲 CARGANDO...' : '🚀 START GAME'}      </StartButton>

      {/* Additional navigation buttons */}
      {!isLoading && (
        <motion.div
          style={{
            display: 'flex',
            gap: '15px',
            marginTop: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {onShowGovernance && (
            <motion.button
              onClick={onShowGovernance}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🏛️ GOVERNANCE
            </motion.button>          )}
          
          {onShowResults && (
            <motion.button
              onClick={onShowResults}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #ffff00, #ff00ff)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📊 RESULTADOS
            </motion.button>
          )}

          {/* Testing button - only in development */}
          {process.env.NODE_ENV === 'development' && onShowTesting && (
            <motion.button
              onClick={onShowTesting}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #ff8800, #ffaa00)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔧 TESTING
            </motion.button>
          )}

          {onLogout && currentUser && (
            <motion.button
              onClick={onLogout}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #666, #888)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚪 LOGOUT
            </motion.button>
          )}
        </motion.div>
      )}

      {/* User info */}
      {currentUser && (
        <UserInfo
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <div>👤 Conectado como: {currentUser.id?.slice(0, 8)}...</div>
          <div className="wallet-address">{currentUser.id}</div>
        </UserInfo>
      )}

      {!isLoading && (
        <Features
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
        >
          <FeatureCard whileHover={{ scale: 1.05 }}>
            <div className="icon">💝</div>
            <div className="title">Juego Solidario</div>
            <div className="description">15% de cada jugada va a la ONG que elijas</div>
          </FeatureCard>

          <FeatureCard whileHover={{ scale: 1.05 }}>
            <div className="icon">🎵</div>
            <div className="title">Experiencia Inmersiva</div>
            <div className="description">Sonidos de casino y efectos neón espectaculares</div>
          </FeatureCard>
        </Features>
      )}

      {isLoading && (
        <LoadingMessage
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎵 Cargando sonidos y efectos...
        </LoadingMessage>
      )}
    </Container>
  )
}