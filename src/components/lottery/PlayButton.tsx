'use client'
import { motion } from 'framer-motion'
import styled from 'styled-components'

const StyledButton = styled(motion.button)`
  background: linear-gradient(45deg, #ff0080, #ff4000);
  border: none;
  border-radius: 15px;
  padding: 15px 30px;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 
    0 0 20px rgba(255, 0, 128, 0.5),
    0 4px 15px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Orbitron', monospace;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: linear-gradient(45deg, #666, #444);
  }

  &:hover:not(:disabled) {
    box-shadow: 
      0 0 30px rgba(255, 0, 128, 0.8),
      0 6px 20px rgba(0, 0, 0, 0.4);
  }
`

interface Props {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
}

export default function PlayButton({ onClick, disabled = false, isLoading = false }: Props) {
  const handleClick = () => {
    console.log('PlayButton clicked!') // ✅ Debug
    onClick()
  }

  return (
    <StyledButton
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={isLoading ? { 
        rotate: 360,
        boxShadow: [
          '0 0 20px rgba(255, 0, 128, 0.5)',
          '0 0 40px rgba(0, 255, 255, 0.8)',
          '0 0 20px rgba(255, 0, 128, 0.5)',
        ]
      } : {}}
      transition={{ 
        duration: isLoading ? 1 : 0.2, 
        repeat: isLoading ? Infinity : 0,
        boxShadow: { duration: 2, repeat: Infinity }
      }}
      onClick={handleClick}
      disabled={disabled}
      style={{ 
        minWidth: '200px', 
        minHeight: '60px',
        display: 'block' // ✅ Forzar que sea visible
      }}
    >
      {isLoading ? '🎲 GIRANDO...' : '🎯 JUGAR AHORA'}
    </StyledButton>
  )
}