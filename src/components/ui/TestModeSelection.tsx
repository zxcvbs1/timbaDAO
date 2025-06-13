'use client'

interface TestModeSelectionProps {
  testMode: 'normal' | 'win' | 'lose' | 'specific'
  testNumbers: string
  selectedNumbers: number | null // 🔥 NEW: Single number
  onTestModeChange: (mode: 'normal' | 'win' | 'lose' | 'specific') => void
  onTestNumbersChange: (numbers: string) => void
}

export default function TestModeSelection({
  testMode,
  testNumbers,
  selectedNumbers,
  onTestModeChange,
  onTestNumbersChange
}: TestModeSelectionProps) {
  if (process.env.NODE_ENV !== 'development') return null

  const handleTestNumbersChange = (value: string) => {
    // 🔥 NEW: Handle 0-99 range instead of 4 digits
    const cleanValue = value.replace(/[^0-9]/g, '')
    const numValue = parseInt(cleanValue)
    if (cleanValue === '' || (numValue >= 0 && numValue <= 99)) {
      onTestNumbersChange(cleanValue)
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-purple-600">
      <h3 className="text-purple-400 text-sm font-bold mb-3">🎯 MODO DE TESTING (Development)</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => onTestModeChange('normal')}
          className={`px-3 py-2 text-xs rounded transition-all ${
            testMode === 'normal' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🎲 Normal
        </button>        <button
          onClick={() => onTestModeChange('win')}
          className={`px-3 py-2 text-xs rounded transition-all ${
            testMode === 'win' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          disabled={selectedNumbers === null} // 🔥 NEW: Check if number is selected
        >
          🏆 Ganar
        </button>
        <button
          onClick={() => onTestModeChange('lose')}
          className={`px-3 py-2 text-xs rounded transition-all ${
            testMode === 'lose' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          disabled={selectedNumbers === null} // 🔥 NEW: Check if number is selected
        >
          💔 Perder
        </button>
        <button
          onClick={() => onTestModeChange('specific')}
          className={`px-3 py-2 text-xs rounded transition-all ${
            testMode === 'specific' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🎯 Específicos
        </button>
      </div>      {testMode === 'specific' && (
        <div className="mb-3">
          <input
            type="text"
            value={testNumbers}
            onChange={(e) => handleTestNumbersChange(e.target.value)}
            placeholder="Ej: 42 (0-99)"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded text-center text-sm font-mono border border-gray-600 focus:border-purple-400 focus:outline-none"
            maxLength={2} // 🔥 NEW: Max 2 digits for 0-99
          />
        </div>
      )}

      <div className="text-xs text-gray-400">
        {testMode === 'normal' && (
          <p>🎲 Sorteo aleatorio normal</p>
        )}
        {testMode === 'win' && selectedNumbers !== null && (
          <p className="text-green-300">🏆 Usará tu número: <span className="font-mono">{selectedNumbers}</span></p>
        )}
        {testMode === 'lose' && selectedNumbers !== null && (
          <p className="text-red-300">💔 Número diferente (garantiza derrota)</p>
        )}
        {testMode === 'specific' && (
          <p className="text-purple-300">
            🎯 {testNumbers !== '' && parseInt(testNumbers) >= 0 && parseInt(testNumbers) <= 99
              ? `Usará: ${testNumbers}` 
              : 'Ingresa un número (0-99)'}
          </p>
        )}
      </div>

      <div className="mt-2 text-xs text-yellow-300">
        ⚡ El modo se aplicará automáticamente al hacer clic en JUGAR
      </div>
    </div>
  )
}
