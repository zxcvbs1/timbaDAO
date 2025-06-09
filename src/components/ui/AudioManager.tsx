'use client'
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useAudio } from '@/hooks/useAudio'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const AudioControls = styled.div`
  position: fixed;
:  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
  align-items: center;
`

const AudioButton = styled(motion.button)`
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00ffff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: #00ffff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  
  &:hover {
    box-shadow: 0 0 15px #00ffff;
  }
`

const VolumeSlider = styled.input`
  width: 100px;
  height: 5px;
  border-radius: 5px;
  background: rgba(0, 255, 255, 0.3);
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #00ffff;
    cursor: pointer;
    box-shadow: 0 0 10px #00ffff;
  }
`

interface Props {
  onPlaySlotSound: () => void
  onPlayWinSound: () => void
  onPlayLoseSound: () => void
}

export interface AudioManagerRef {
  playSlotSound: () => void
  playWinSound: () => void
  playLoseSound: () => void
  startBackgroundMusic: () => void
  setVolumeToMax: () => void
}

const AudioManager = forwardRef<AudioManagerRef, Props>(
  ({ onPlaySlotSound, onPlayWinSound, onPlayLoseSound }, ref) => {
    const [volume, setVolume] = useState(0.75) // Iniciar en 75%
    const [isMuted, setIsMuted] = useState(false)
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false)

    // Música de fondo de casino
    const backgroundMusic = useAudio('/sounds/casino-ambient.mp3', { 
      loop: true, 
      volume: volume * 0.5,
      autoplay: false 
    })

    // Efectos de sonido
    const slotSound = useAudio('/sounds/slot-machine.mp3', { volume })
    const winSound = useAudio('/sounds/win-jackpot.mp3', { volume })
    const loseSound = useAudio('/sounds/lose-sound.mp3', { volume })
    const clickSound = useAudio('/sounds/button-click.mp3', { volume: volume * 0.8 })

    useEffect(() => {
      if (!isMuted) {
        backgroundMusic.setVolume(volume * 0.5)
        slotSound.setVolume(volume)
        winSound.setVolume(volume)
        loseSound.setVolume(volume)
        clickSound.setVolume(volume * 0.8)
      } else {
        backgroundMusic.setVolume(0)
        slotSound.setVolume(0)
        winSound.setVolume(0)
        loseSound.setVolume(0)
        clickSound.setVolume(0)
      }
    }, [volume, isMuted])

    // Exponer funciones mediante useImperativeHandle
    useImperativeHandle(ref, () => ({
      playSlotSound: () => {
        clickSound.play()
        slotSound.play()
      },
      playWinSound: () => winSound.play(),
      playLoseSound: () => loseSound.play(),
      startBackgroundMusic: () => {
        if (!hasStartedPlaying) {
          backgroundMusic.play()
          setHasStartedPlaying(true)
        }
      },
      setVolumeToMax: () => {
        setVolume(0.75) // 75% de volumen
      }
    }))

    const toggleMusic = () => {
      if (backgroundMusic.isPlaying) {
        backgroundMusic.pause()
      } else {
        backgroundMusic.play()
        setHasStartedPlaying(true)
      }
    }

    const toggleMute = () => {
      setIsMuted(!isMuted)
    }

    return (
      <AudioControls>
        <AudioButton
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          title="Música de fondo"
        >
          {backgroundMusic.isPlaying ? '🎵' : '🔇'}
        </AudioButton>
        
        <AudioButton
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          title="Silenciar efectos"
        >
          {isMuted ? '🔇' : '🔊'}
        </AudioButton>
        
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          title="Volumen"
        />
      </AudioControls>
    )
  }
)

AudioManager.displayName = 'AudioManager'

export default AudioManager