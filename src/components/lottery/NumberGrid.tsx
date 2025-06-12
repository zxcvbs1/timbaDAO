'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'

const GridContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid #00ffff;
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
`

const GridTitle = styled.h2`
  text-align: center;
  color: #00ffff;
  font-size: 24px;
  margin-bottom: 20px;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  font-family: 'Orbitron', monospace;
`

const NumbersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
`

interface NumberButtonProps {
  isSelected: boolean
  isDisabled: boolean
  isTaken: boolean
}

const NumberButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['isSelected', 'isDisabled', 'isTaken'].includes(prop),
})<NumberButtonProps>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 2px solid;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Orbitron', monospace;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => {
    if (props.isTaken) {
      return `
        background: linear-gradient(45deg, #ff4444, #ff8888);
        border-color: #ff4444;
        color: #fff;
        cursor: not-allowed;
        opacity: 0.6;
      `;
    } else if (props.isSelected) {
      return `
        background: linear-gradient(45deg, #00ff00, #88ff88);
        border-color: #00ff00;
        color: #000;
        box-shadow: 
          0 0 20px rgba(0, 255, 0, 0.5),
          inset 0 0 10px rgba(0, 255, 0, 0.2);
      `;
    } else if (props.isDisabled) {
      return `
        background: linear-gradient(45deg, #666, #888);
        border-color: #666;
        color: #ccc;
        cursor: not-allowed;
        opacity: 0.5;
      `;
    } else {
      return `
        background: linear-gradient(45deg, #0066ff, #0088ff);
        border-color: #0088ff;
        color: #fff;
        
        &:hover {
          background: linear-gradient(45deg, #0088ff, #00aaff);
          border-color: #00aaff;
          box-shadow: 0 0 15px rgba(0, 136, 255, 0.4);
          transform: scale(1.05);
        }
      `;
    }
  }}
  
  &:active {
    transform: scale(0.95);
  }
`

const SelectedNumberDisplay = styled(motion.div)`
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #00ff00;
  border-radius: 15px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const SelectedNumberValue = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  font-family: 'Orbitron', monospace;
  margin-bottom: 8px;
`

const SelectedNumberLabel = styled.div`
  font-size: 14px;
  color: #00ffff;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const InfoSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.3);
`

const InfoText = styled.p`
  color: #00ffff;
  font-size: 14px;
  margin: 5px 0;
  text-align: center;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  margin: 10px 0;
  overflow: hidden;
`

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #ff00ff, #00ffff);
  border-radius: 3px;
`

interface NumberGridProps {
  selectedNumber: number | null
  onNumberSelect: (number: number) => void
  disabled?: boolean
  takenNumbers?: number[] // Números ya tomados en esta ronda
  roundProgress?: {
    totalSlots: number
    takenSlots: number
    timeRemaining?: string
  }
}

export default function NumberGrid({ 
  selectedNumber, 
  onNumberSelect, 
  disabled = false,
  takenNumbers = [],
  roundProgress
}: NumberGridProps) {
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null)

  // Generar números del 0 al 99
  const numbers = Array.from({ length: 100 }, (_, i) => i)

  const handleNumberClick = (number: number) => {
    if (disabled || takenNumbers.includes(number)) return
    
    if (selectedNumber === number) {
      // Deseleccionar si ya está seleccionado
      onNumberSelect(-1) // -1 significa deseleccionar
    } else {
      onNumberSelect(number)
    }
  }

  const progressPercentage = roundProgress 
    ? (roundProgress.takenSlots / roundProgress.totalSlots) * 100 
    : 0

  return (
    <GridContainer>
      <GridTitle>🎯 Selecciona tu número de la suerte</GridTitle>
      
      {/* Display del número seleccionado */}
      <SelectedNumberDisplay
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {selectedNumber !== null && selectedNumber >= 0 ? (
          <>
            <SelectedNumberValue
              as={motion.div}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {selectedNumber.toString().padStart(2, '0')}
            </SelectedNumberValue>
            <SelectedNumberLabel>Tu número seleccionado</SelectedNumberLabel>
          </>
        ) : (
          <SelectedNumberLabel style={{ color: '#888' }}>
            Haz clic en un número para seleccionarlo
          </SelectedNumberLabel>
        )}
      </SelectedNumberDisplay>

      {/* Grid de números */}
      <NumbersGrid>
        <AnimatePresence>
          {numbers.map((number) => {
            const isSelected = selectedNumber === number
            const isTaken = takenNumbers.includes(number)
            const isDisabled = disabled
            
            return (
              <NumberButton
                key={number}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isTaken={isTaken}
                onClick={() => handleNumberClick(number)}
                disabled={isDisabled || isTaken}
                onMouseEnter={() => setHighlightedNumber(number)}
                onMouseLeave={() => setHighlightedNumber(null)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 0.2,
                  delay: (number % 10) * 0.02 // Animación escalonada por filas
                }}
                whileHover={{ scale: isTaken ? 1 : 1.05 }}
                whileTap={{ scale: isTaken ? 1 : 0.95 }}
              >
                {number.toString().padStart(2, '0')}
                {isTaken && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '12px',
                      color: '#fff',
                      fontWeight: 'bold'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ❌
                  </motion.div>
                )}
              </NumberButton>
            )
          })}
        </AnimatePresence>
      </NumbersGrid>

      {/* Información de progreso de la ronda */}
      {roundProgress && (
        <InfoSection>
          <InfoText>
            📊 Progreso de la ronda: {roundProgress.takenSlots}/{roundProgress.totalSlots} números tomados
          </InfoText>
          <ProgressBar>
            <ProgressFill
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </ProgressBar>
          {roundProgress.timeRemaining && (
            <InfoText>
              ⏰ Tiempo restante: {roundProgress.timeRemaining}
            </InfoText>
          )}
        </InfoSection>
      )}

      {/* Información del juego */}
      <InfoSection>
        <InfoText>
          🎮 <strong>Nuevo sistema:</strong> Cada número es único por ronda
        </InfoText>
        <InfoText>
          💎 Solo UN jugador puede elegir cada número (0-99)
        </InfoText>
        <InfoText>
          🏆 ¡El ganador se lleva TODO el premio de su número!
        </InfoText>
        {takenNumbers.length > 0 && (
          <InfoText>
            🚫 Números ya tomados: {takenNumbers.length}/100
          </InfoText>
        )}
      </InfoSection>
    </GridContainer>
  )
}
