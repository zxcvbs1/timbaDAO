'use client'
import { useState } from 'react'

interface AdminTestingPanelProps {
  onExecuteDraw: (specificNumbers?: number[]) => void
  isExecuting: boolean
  selectedNumbers: string
}

export default function AdminTestingPanel({ 
  onExecuteDraw, 
  isExecuting, 
  selectedNumbers 
}: AdminTestingPanelProps) {
  const [testNumbers, setTestNumbers] = useState('')
  const [testMode, setTestMode] = useState<'random' | 'specific' | 'win' | 'lose'>('random')

  const handleExecuteDraw = async () => {
    let numbersToUse: number[] | undefined

    switch (testMode) {
      case 'specific':
        if (testNumbers.length === 4) {
          numbersToUse = testNumbers.split('').map(Number)
        }
        break
      case 'win':
        // Usar los números seleccionados por el usuario para garantizar una victoria
        if (selectedNumbers.length === 4) {
          numbersToUse = selectedNumbers.split('').map(Number)
        }
        break
      case 'lose':
        // Usar números que definitivamente no coincidan
        const playerNumbers = selectedNumbers.split('').map(Number)
        numbersToUse = playerNumbers.map(num => num === 9 ? 0 : 9) // Números opuestos
        break
      default:
        // random - no especificar números
        numbersToUse = undefined
    }

    // Llamar al handler con los números específicos o undefined para aleatorio
    if (testMode === 'random') {
      await onExecuteDraw()
    } else {
      await fetch('/api/admin/execute-draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ winningNumbers: numbersToUse })
      }).then(async (response) => {
        const data = await response.json()
        if (data.success) {
          // Mostrar resultado exitoso
          console.log('✅ Draw executed with specific numbers:', data.result)
        } else {
          console.error('❌ Draw failed:', data.error)
        }
      }).catch(error => {
        console.error('Error:', error)
      })
    }
  }

  const handleTestNumbersChange = (value: string) => {
    // Solo permitir números 0-9 y máximo 4 dígitos
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 4)
    setTestNumbers(cleanValue)
  }

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
      <h3 className="text-yellow-400 text-sm font-bold mb-4">🔧 PANEL DE TESTING AVANZADO</h3>
      
      {/* Selector de modo */}
      <div className="mb-4">
        <label className="text-cyan-400 text-xs font-semibold mb-2 block">Modo de Testing:</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setTestMode('random')}
            className={`px-3 py-2 text-xs rounded transition-all ${
              testMode === 'random' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎲 Aleatorio
          </button>
          <button
            onClick={() => setTestMode('win')}
            className={`px-3 py-2 text-xs rounded transition-all ${
              testMode === 'win' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            disabled={selectedNumbers.length !== 4}
          >
            🏆 Forzar Victoria
          </button>
          <button
            onClick={() => setTestMode('lose')}
            className={`px-3 py-2 text-xs rounded transition-all ${
              testMode === 'lose' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            disabled={selectedNumbers.length !== 4}
          >
            💔 Forzar Derrota
          </button>
          <button
            onClick={() => setTestMode('specific')}
            className={`px-3 py-2 text-xs rounded transition-all ${
              testMode === 'specific' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎯 Específicos
          </button>
        </div>
      </div>

      {/* Input para números específicos */}
      {testMode === 'specific' && (
        <div className="mb-4">
          <label className="text-cyan-400 text-xs font-semibold mb-2 block">
            Números Ganadores (4 dígitos 0-9):
          </label>
          <input
            type="text"
            value={testNumbers}
            onChange={(e) => handleTestNumbersChange(e.target.value)}
            placeholder="ej: 1234"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded text-center text-lg tracking-wider font-mono border border-gray-600 focus:border-cyan-400 focus:outline-none"
            maxLength={4}
          />
        </div>
      )}

      {/* Información del modo actual */}
      <div className="mb-4 p-3 bg-gray-700 rounded text-xs">
        {testMode === 'random' && (
          <p className="text-blue-300">🎲 Se generarán números aleatorios</p>
        )}
        {testMode === 'win' && selectedNumbers.length === 4 && (
          <p className="text-green-300">🏆 Se usarán tus números: <span className="font-mono">{selectedNumbers}</span></p>
        )}
        {testMode === 'lose' && selectedNumbers.length === 4 && (
          <p className="text-red-300">💔 Se usarán números opuestos para garantizar derrota</p>
        )}
        {testMode === 'specific' && (
          <p className="text-purple-300">
            🎯 {testNumbers.length === 4 
              ? `Se usarán: ${testNumbers}` 
              : 'Ingresa 4 números específicos'}
          </p>
        )}
      </div>

      {/* Botón de ejecución */}
      <button
        onClick={handleExecuteDraw}
        disabled={
          isExecuting || 
          (testMode === 'specific' && testNumbers.length !== 4) ||
          ((testMode === 'win' || testMode === 'lose') && selectedNumbers.length !== 4)
        }
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
      >
        {isExecuting ? '⏳ Ejecutando Sorteo...' : '🎲 Ejecutar Sorteo Controlado'}
      </button>

      {/* Instrucciones */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p><strong>Cómo usar:</strong></p>
        <p>1. Primero coloca una apuesta con números</p>
        <p>2. Elige el modo de testing que quieras</p>
        <p>3. Ejecuta el sorteo y verifica resultados</p>
        <p>4. Los resultados aparecen en el área de mensajes arriba</p>
      </div>
    </div>
  )
}
