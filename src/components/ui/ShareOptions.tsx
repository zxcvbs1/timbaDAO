'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { useTweetGenerator } from '@/hooks/useTweetGenerator'

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`

const ShareButton = styled(motion.button)`
  background: linear-gradient(45deg, #1da1f2, #0d8bd9);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 
    0 0 15px rgba(29, 161, 242, 0.4),
    0 4px 15px rgba(0, 0, 0, 0.3);
  font-family: 'Orbitron', monospace;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: center;

  &:hover {
    box-shadow: 
      0 0 25px rgba(29, 161, 242, 0.6),
      0 6px 20px rgba(0, 0, 0, 0.4);
  }
`

const RegenerateButton = styled(motion.button)`
  background: transparent;
  border: 2px solid #00ffff;
  border-radius: 8px;
  padding: 8px 16px;
  color: #00ffff;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Orbitron', monospace;

  &:hover {
    background: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 15px #00ffff;
  }
`

interface Props {
  selectedNumbers: string
  winningNumbers: string
  isWinner: boolean
}

export default function ShareOptions({ selectedNumbers, winningNumbers, isWinner }: Props) {
  const [refreshKey, setRefreshKey] = useState(0)
  
  const tweetText = useTweetGenerator({ 
    selectedNumbers, 
    winningNumbers, 
    isWinner,
    key: refreshKey 
  })

  const handleShare = () => {
    const encodedText = encodeURIComponent(tweetText)
    const url = encodeURIComponent(window.location.href)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`
    
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const handleRegenerate = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <ShareContainer>
      <ShareButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
      >
        <span>🐦</span>
        Compartir en Twitter
      </ShareButton>
      
      <RegenerateButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRegenerate}
      >
        🔄 Cambiar mensaje
      </RegenerateButton>
    </ShareContainer>
  )
}