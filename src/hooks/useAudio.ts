'use client'
import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

interface AudioOptions {
  loop?: boolean
  volume?: number
  autoplay?: boolean
}

export function useAudio(src: string, options: AudioOptions = {}) {
  const soundRef = useRef<Howl | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    soundRef.current = new Howl({
      src: [src],
      loop: options.loop || false,
      volume: options.volume || 0.5,
      autoplay: options.autoplay || false,
      onload: () => setIsLoaded(true),
      onplay: () => setIsPlaying(true),
      onstop: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
    })

    return () => {
      soundRef.current?.unload()
    }
  }, [src, options.loop, options.volume, options.autoplay])

  const play = () => {
    if (soundRef.current && isLoaded) {
      soundRef.current.play()
    }
  }

  const stop = () => {
    if (soundRef.current) {
      soundRef.current.stop()
    }
  }

  const pause = () => {
    if (soundRef.current) {
      soundRef.current.pause()
    }
  }

  const setVolume = (volume: number) => {
    if (soundRef.current) {
      soundRef.current.volume(volume)
    }
  }

  return { play, stop, pause, setVolume, isPlaying, isLoaded }
}