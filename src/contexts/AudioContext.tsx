'use client'
import { createContext, useContext, useRef, ReactNode } from 'react'
import AudioManager, { AudioManagerRef } from '@/components/ui/AudioManager'

interface AudioContextType {
  audioRef: React.RefObject<AudioManagerRef>
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<AudioManagerRef>(null)

  return (
    <AudioContext.Provider value={{ audioRef }}>
      {/* ✅ AudioManager ÚNICO para toda la app */}
      <AudioManager
        ref={audioRef}
        onPlaySlotSound={() => {}}
        onPlayWinSound={() => {}}
        onPlayLoseSound={() => {}}
      />
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return context.audioRef
}