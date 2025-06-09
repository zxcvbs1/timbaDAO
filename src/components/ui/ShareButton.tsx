'use client'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { useTweetGenerator } from '@/hooks/useTweetGenerator'
import { ONG } from '@/types/ong'

const StyledShareButton = styled(motion.button)`
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
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Orbitron', monospace;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;

  &:hover {
    box-shadow: 
      0 0 25px rgba(29, 161, 242, 0.6),
      0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const DonationInfo = styled.div`
  text-align: center;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  color: #00ffff;
  font-size: 14px;
  font-family: 'Orbitron', monospace;
`

interface Props {
  selectedNumbers: string
  winningNumbers: string
  isWinner: boolean
  selectedONG: ONG
  disabled?: boolean
}

export default function ShareButton({ selectedNumbers, winningNumbers, isWinner, selectedONG, disabled = false }: Props) {
  const tweetText = useTweetGenerator({ 
    selectedNumbers, 
    winningNumbers, 
    isWinner, 
    selectedONG 
  })

  const handleShare = () => {
    const encodedText = encodeURIComponent(tweetText)
    const url = encodeURIComponent(window.location.href)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`
    
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  return (
    <div>
      <DonationInfo>
        💝 15% de tu jugada va para {selectedONG.name} {selectedONG.icon}
        <br />
        <small>¡Cada participación cuenta!</small>
      </DonationInfo>
      
      <StyledShareButton
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={handleShare}
        disabled={disabled}
      >
        <span>🐦</span>
        Compartir victoria solidaria
      </StyledShareButton>
    </div>
  )
}