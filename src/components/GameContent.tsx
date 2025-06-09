'use client'
import { useState } from 'react'
import NeonDisplay from '@/components/lottery/NeonDisplay'
import NumberInput from '@/components/lottery/NumberInput'
import PlayButton from '@/components/lottery/PlayButton'
import BackgroundEffect from '@/components/ui/BackgroundEffect'
import ShareButton from '@/components/ui/ShareButton'
import ONGSelector from '@/components/ong/ONGSelector'
import StartScreen from '@/components/ui/StartScreen'
import { AudioProvider, useAudio } from '@/contexts/AudioContext'
import { ONG } from '@/types/ong'

function GameContentInner() {
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedONG, setSelectedONG] = useState<ONG | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [winningNumbers, setWinningNumbers] = useState('')
  const [hasPlayed, setHasPlayed] = useState(false)
  
  const audioRef = useAudio()

  const handleStartGame = () => {
    setGameStarted(true)
    
    setTimeout(() => {
      audioRef.current?.setVolumeToMax()
      audioRef.current?.startBackgroundMusic()
    }, 500)
  }

  const handleSelectONG = (ong: ONG) => {
    setSelectedONG(ong)
  }

  const handlePlay = () => {
    if (selectedNumbers.length !== 4) return
    
    setIsPlaying(true)
    setHasPlayed(false)
    
    audioRef.current?.playSlotSound()
    
    setTimeout(() => {
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      setWinningNumbers(random)
      setIsPlaying(false)
      setHasPlayed(true)
      
      if (selectedNumbers === random) {
        audioRef.current?.playWinSound()
      } else {
        audioRef.current?.playLoseSound()
      }
    }, 3000)
  }

  const handleNewGame = () => {
    setSelectedNumbers('')
    setWinningNumbers('')
    setHasPlayed(false)
  }

  const handleBackToONGSelection = () => {
    setSelectedONG(null)
    setSelectedNumbers('')
    setWinningNumbers('')
    setHasPlayed(false)
  }

  const handleBackToStart = () => {
    setGameStarted(false)
    setSelectedONG(null)
    setSelectedNumbers('')
    setWinningNumbers('')
    setHasPlayed(false)
  }

  const isWinner = selectedNumbers === winningNumbers && hasPlayed

  // Pantalla de inicio
  if (!gameStarted) {
    return <StartScreen onStart={handleStartGame} />
  }

  // Selector de ONG
  if (!selectedONG) {
    return (
      <>
        <button
          onClick={handleBackToStart}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-bold hover:from-gray-700 hover:to-gray-900 transition-all duration-300 hover:scale-105"
        >
          ← Volver al inicio
        </button>
        
        <ONGSelector onSelectONG={handleSelectONG} />
      </>
    )
  }

  // Pantalla principal del juego
  return (
    <>
      <BackgroundEffect />
      
      <main className="min-h-screen relative">
        <button
          onClick={handleBackToONGSelection}
          className="fixed top-4 left-4 z-50 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
        >
          ← Cambiar ONG
        </button>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">{selectedONG.icon}</div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">
              Jugando para: {selectedONG.name}
            </h2>
            <p className="text-sm text-gray-300 max-w-md mb-2">
              {selectedONG.mission}
            </p>
            <div className="text-xs text-yellow-400 font-bold">
              💝 15% de cada jugada va directo a esta ONG
            </div>
          </div>

          <h1 className="text-6xl font-bold text-center mb-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            🎰 SUPER LOTERÍA 🎰
          </h1>

          <div className="mb-8">
            <h2 className="text-2xl text-cyan-400 text-center mb-4">Tus números:</h2>
            <NeonDisplay numbers={selectedNumbers.split('')} color="cyan" />
            {selectedNumbers.length > 0 && selectedNumbers.length < 4 && (
              <p className="text-center text-yellow-400 mt-2 text-sm">
                Ingresa {4 - selectedNumbers.length} dígito{4 - selectedNumbers.length > 1 ? 's' : ''} más
              </p>
            )}
            {selectedNumbers.length === 4 && (
              <p className="text-center text-green-400 mt-2 text-sm animate-pulse">
                ✅ ¡Listo para jugar!
              </p>
            )}
          </div>

          <div className="mb-8">
            <NumberInput 
              value={selectedNumbers}
              onChange={setSelectedNumbers}
              disabled={isPlaying}
            />
          </div>

          <div className="mb-8">
            <PlayButton 
              onClick={handlePlay}
              disabled={selectedNumbers.length !== 4 || isPlaying}
              isLoading={isPlaying}
            />
            {selectedNumbers.length !== 4 && !isPlaying && (
              <p className="text-center text-red-400 mt-2 text-sm">
                Necesitas ingresar exactamente 4 números para jugar
              </p>
            )}
          </div>

          {winningNumbers && (
            <div className="mb-8">
              <h2 className="text-2xl text-pink-400 text-center mb-4">Números ganadores:</h2>
              <NeonDisplay numbers={winningNumbers.split('')} color="pink" />
              
              {isWinner ? (
                <div className="text-center mt-4">
                  <p className="text-4xl text-yellow-400 mb-4" style={{ textShadow: '0 0 20px #ffff00' }}>
                    🎉 ¡GANASTE! 🎉
                  </p>
                  <p className="text-lg text-green-400 mb-4">
                    ¡Tu victoria ayuda a {selectedONG.name}! 🎯
                  </p>
                  <div className="space-y-4">
                    <ShareButton 
                      selectedNumbers={selectedNumbers}
                      winningNumbers={winningNumbers}
                      isWinner={true}
                      selectedONG={selectedONG}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center mt-4">
                  <p className="text-xl text-red-400 mb-2">¡Inténtalo de nuevo!</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Tu jugada igual ayudó a {selectedONG.name} 💝
                  </p>
                  <div className="space-y-4">
                    <ShareButton 
                      selectedNumbers={selectedNumbers}
                      winningNumbers={winningNumbers}
                      isWinner={false}
                      selectedONG={selectedONG}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {hasPlayed && (
            <div className="mt-4">
              <button
                onClick={handleNewGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
              >
                🎲 Nueva Partida Solidaria
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function GameContent() {
  return (
    <AudioProvider>
      <GameContentInner />
    </AudioProvider>
  )
}