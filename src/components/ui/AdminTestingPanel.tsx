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
  const [testNumber, setTestNumber] = useState('')
  const [testMode, setTestMode] = useState<'random' | 'specific' | 'win' | 'lose'>('random')
  const handleExecuteDraw = async () => {
    let numbersToUse: number[] | undefined

    switch (testMode) {
      case 'specific':
        // 🔥 NEW: Single number (0-99)
        const num = parseInt(testNumber)
        if (num >= 0 && num <= 99) {
          numbersToUse = [num]
        }
        break
      case 'win':
        // Usar el número seleccionado por el usuario para garantizar una victoria
        const playerNum = parseInt(selectedNumbers)
        if (playerNum >= 0 && playerNum <= 99) {
          numbersToUse = [playerNum]
        }
        break
      case 'lose':
        // Usar un número que definitivamente no coincida
        const playerNumber = parseInt(selectedNumbers)
        const loseNumber = playerNumber === 99 ? 0 : playerNumber + 1
        numbersToUse = [loseNumber]
        break
      default:
        // random - no especificar números
        numbersToUse = undefined
    }

    // Usar el handler pasado como prop de manera consistente
    onExecuteDraw(numbersToUse)
  }

  const handleTestNumberChange = (value: string) => {
    // 🔥 NEW: Solo permitir números 0-99
    const cleanValue = value.replace(/[^0-9]/g, '')
    const numValue = parseInt(cleanValue)
    if (cleanValue === '' || (numValue >= 0 && numValue <= 99)) {
      setTestNumber(cleanValue)
    }
  }
  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
      <h3 className="text-yellow-400 text-sm font-bold mb-4">🔧 PANEL DE TESTING AVANZADO (0-99)</h3>
      
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
            disabled={!selectedNumbers || selectedNumbers === ''}
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
            disabled={!selectedNumbers || selectedNumbers === ''}
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

      {/* Input para número específico */}
      {testMode === 'specific' && (
        <div className="mb-4">
          <label className="text-cyan-400 text-xs font-semibold mb-2 block">
            Número Ganador (0-99):
          </label>
          <input
            type="text"
            value={testNumber}
            onChange={(e) => handleTestNumberChange(e.target.value)}
            placeholder="Ej: 42"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded text-center text-sm font-mono border border-gray-600 focus:border-purple-400 focus:outline-none"
            maxLength={2}
          />
        </div>
      )}

      {/* Información del modo actual */}
      <div className="mb-4 text-xs text-gray-300">
        {testMode === 'random' && (
          <p>🎲 <strong>Aleatorio:</strong> El sistema elegirá un número ganador al azar (0-99)</p>
        )}
        {testMode === 'win' && selectedNumbers && (
          <p className="text-green-300">
            🏆 <strong>Forzar Victoria:</strong> El número ganador será <span className="font-mono bg-green-900 px-1 rounded">{selectedNumbers}</span>
          </p>
        )}
        {testMode === 'lose' && selectedNumbers && (
          <p className="text-red-300">
            💔 <strong>Forzar Derrota:</strong> El número ganador será diferente a <span className="font-mono bg-red-900 px-1 rounded">{selectedNumbers}</span>
          </p>
        )}
        {testMode === 'specific' && (
          <p className="text-purple-300">
            🎯 <strong>Específico:</strong> {
              testNumber !== '' && parseInt(testNumber) >= 0 && parseInt(testNumber) <= 99
                ? `El número ganador será ${testNumber}`
                : 'Ingresa un número entre 0 y 99'
            }
          </p>
        )}
      </div>

      {/* Botón de ejecución */}
      <button
        onClick={handleExecuteDraw}
        disabled={
          isExecuting || 
          (testMode === 'specific' && (testNumber === '' || parseInt(testNumber) > 99)) ||
          ((testMode === 'win' || testMode === 'lose') && (!selectedNumbers || selectedNumbers === ''))
        }
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
      >
        {isExecuting ? '⏳ Ejecutando Sorteo...' : '🎲 Ejecutar Sorteo Controlado'}
      </button>

      {/* Instrucciones */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p><strong>Cómo usar:</strong></p>        <p>1. Primero selecciona un número en la grilla (0-99)</p>
        <p>2. Elige el modo de testing deseado</p>
        <p>3. Ejecuta el sorteo controlado</p>
        <p><strong>Nota:</strong> Solo funciona en modo desarrollo</p>
      </div>
    </div>
  )
}
