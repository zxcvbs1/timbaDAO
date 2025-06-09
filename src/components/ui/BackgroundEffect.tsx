'use client'
import { motion } from 'framer-motion'
import styled from 'styled-components'

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%);
  overflow: hidden;
`

const FloatingOrb = styled(motion.div)<{ color: string; size: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: ${props => props.color};
  filter: blur(2px);
  opacity: 0.3;
`

const GridPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;

  @keyframes grid-move {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`

export default function BackgroundEffect() {
  const orbs = [
    { color: '#ff00ff', size: 100, x: '10%', y: '20%' },
    { color: '#00ffff', size: 150, x: '80%', y: '70%' },
    { color: '#ffff00', size: 80, x: '60%', y: '30%' },
    { color: '#ff0080', size: 120, x: '20%', y: '80%' },
    { color: '#00ff80', size: 90, x: '90%', y: '10%' },
  ]

  return (
    <BackgroundContainer>
      <GridPattern />
      {orbs.map((orb, index) => (
        <FloatingOrb
          key={index}
          color={orb.color}
          size={orb.size}
          style={{ left: orb.x, top: orb.y }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -20, 20, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </BackgroundContainer>
  )
}