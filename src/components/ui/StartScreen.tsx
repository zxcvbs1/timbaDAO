'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'

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

interface Props {
  onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = () => {
    console.log('START GAME clicked!') // ✅ Debug
    setIsLoading(true)
    
    setTimeout(() => {
      console.log('Calling onStart...') // ✅ Debug
      onStart()
    }, 2000)
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
        {isLoading ? '🎲 CARGANDO...' : '🚀 START GAME'}
      </StartButton>

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