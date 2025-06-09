'use client'

interface TestModeSelectionProps {
  testMode: 'normal' | 'win' | 'lose' | 'specific'
  testNumbers: string
  selectedNumbers: string
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
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 4)
    onTestNumbersChange(cleanValue)
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
        </button>
        <button
          onClick={() => onTestModeChange('win')}
          className={`px-3 py-2 text-xs rounded transition-all ${
            testMode === 'win' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          disabled={selectedNumbers.length !== 4}
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
          disabled={selectedNumbers.length !== 4}
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
      </div>

      {testMode === 'specific' && (
        <div className="mb-3">
          <input
            type="text"
            value={testNumbers}
            onChange={(e) => handleTestNumbersChange(e.target.value)}
            placeholder="Ej: 5678"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded text-center text-sm font-mono border border-gray-600 focus:border-purple-400 focus:outline-none"
            maxLength={4}
          />
        </div>
      )}

      <div className="text-xs text-gray-400">
        {testMode === 'normal' && (
          <p>🎲 Sorteo aleatorio normal</p>
        )}
        {testMode === 'win' && selectedNumbers.length === 4 && (
          <p className="text-green-300">🏆 Usará tus números: <span className="font-mono">{selectedNumbers}</span></p>
        )}
        {testMode === 'lose' && selectedNumbers.length === 4 && (
          <p className="text-red-300">💔 Números opuestos (garantiza derrota)</p>
        )}
        {testMode === 'specific' && (
          <p className="text-purple-300">
            🎯 {testNumbers.length === 4 
              ? `Usará: ${testNumbers}` 
              : 'Ingresa 4 números (0-9)'}
          </p>
        )}
      </div>

      <div className="mt-2 text-xs text-yellow-300">
        ⚡ El modo se aplicará automáticamente al hacer clic en JUGAR
      </div>
    </div>
  )
}
