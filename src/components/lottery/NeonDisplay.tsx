'use client'
import { motion } from 'framer-motion'
import styled from 'styled-components'

interface NeonDigitProps {
  color: string
}

const NeonBoard = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid;
  border-radius: 20px;
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* ✅ Exactamente 4 columnas */
  gap: 15px;
  backdrop-filter: blur(10px);
`

const NeonDigit = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<NeonDigitProps>`
  width: 80px;
  height: 100px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 900;
  font-family: 'Orbitron', monospace;
  
  border-color: ${props => 
    props.color === 'cyan' ? '#00ffff' : 
    props.color === 'pink' ? '#ff00ff' : 
    '#00ff00'};
  
  color: ${props => 
    props.color === 'cyan' ? '#00ffff' : 
    props.color === 'pink' ? '#ff00ff' : 
    '#00ff00'};

  box-shadow: 
    0 0 15px ${props => 
      props.color === 'cyan' ? 'rgba(0, 255, 255, 0.5)' : 
      props.color === 'pink' ? 'rgba(255, 0, 255, 0.5)' : 
      'rgba(0, 255, 0, 0.5)'};
`

interface Props {
  numbers: string[]
  color?: 'cyan' | 'pink' | 'green'
}

export default function NeonDisplay({ numbers, color = 'cyan' }: Props) {
  // ✅ Asegurar que siempre sean exactamente 4 dígitos
  const displayNumbers = Array(4).fill('0').map((_, index) => 
    numbers[index] || '0'
  )

  const borderColor = color === 'cyan' ? '#00ffff' : color === 'pink' ? '#ff00ff' : '#00ff00'

  return (
    <NeonBoard style={{ borderColor }}>
      {displayNumbers.map((digit, index) => (
        <NeonDigit
          key={index}
          color={color}
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 100 
          }}
          whileHover={{ scale: 1.1 }}
        >
          {digit}
        </NeonDigit>
      ))}
    </NeonBoard>
  )
}