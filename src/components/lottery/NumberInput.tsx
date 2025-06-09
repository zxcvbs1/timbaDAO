'use client'
import styled from 'styled-components'

const StyledInput = styled.input`
  background: transparent;
  border: 3px solid #00ff00;
  border-radius: 10px;
  padding: 15px;
  color: #00ff00;
  font-size: 24px;
  font-family: 'Orbitron', monospace;
  text-align: center;
  width: 200px;
  box-shadow: 
    0 0 15px #00ff00,
    inset 0 0 15px rgba(0, 255, 0, 0.1);
  
  &:focus {
    outline: none;
    box-shadow: 
      0 0 25px #00ff00,
      inset 0 0 25px rgba(0, 255, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: rgba(0, 255, 0, 0.5);
  }
`

interface Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function NumberInput({ value, onChange, disabled = false }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, '') // Solo números
    if (inputValue.length <= 4) {
      onChange(inputValue)
    }
  }

  return (
    <StyledInput
      type="text"
      maxLength={4}
      placeholder="0000"
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  )
}