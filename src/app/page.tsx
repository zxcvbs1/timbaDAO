'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// ✅ Cargar el componente principal solo del lado del cliente
const GameContentClient = dynamic(() => import('../components/GameContent'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#00ffff',
      fontSize: '24px',
      fontFamily: 'Orbitron, monospace'
    }}>
      🎰 Cargando Super Lotería... 🎰
    </div>
  )
})

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00ffff',
        fontSize: '24px',
        fontFamily: 'Orbitron, monospace'
      }}>
        🎰 Inicializando... 🎰
      </div>
    )
  }

  return <GameContentClient />
}
