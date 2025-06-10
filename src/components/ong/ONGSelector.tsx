'use client'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'
import { apiClient, ONG } from '@/lib/api-client'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%);
  padding: 20px;
  font-family: 'Orbitron', monospace;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00);
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
  margin-bottom: 20px;
  animation: neonGlow 2s ease-in-out infinite alternate;
`

const Subtitle = styled.p`
  color: #00ffff;
  font-size: 18px;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
`

const SearchContainer = styled.div`
  max-width: 500px;
  margin: 0 auto 40px;
  position: relative;
`

const SearchInput = styled.input`
  width: 100%;
  background: transparent;
  border: 3px solid #00ffff;
  border-radius: 15px;
  padding: 15px 20px;
  color: #00ffff;
  font-size: 18px;
  font-family: 'Orbitron', monospace;
  text-align: center;
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.3),
    inset 0 0 15px rgba(0, 255, 255, 0.1);
  
  &:focus {
    outline: none;
    box-shadow: 
      0 0 25px rgba(0, 255, 255, 0.5),
      inset 0 0 25px rgba(0, 255, 255, 0.2);
  }

  &::placeholder {
    color: rgba(0, 255, 255, 0.5);
  }
`

const SearchIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #00ffff;
  font-size: 20px;
  pointer-events: none;
`

const ONGGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`

const ONGCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange' }>`
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid ${props => 
    props.color === 'cyan' ? '#00ffff' : 
    props.color === 'pink' ? '#ff00ff' : 
    props.color === 'green' ? '#00ff00' :
    props.color === 'purple' ? '#8000ff' :
    '#ff8000'};
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 
      0 0 30px ${props => 
        props.color === 'cyan' ? 'rgba(0, 255, 255, 0.5)' : 
        props.color === 'pink' ? 'rgba(255, 0, 255, 0.5)' : 
        props.color === 'green' ? 'rgba(0, 255, 0, 0.5)' :
        props.color === 'purple' ? 'rgba(128, 0, 255, 0.5)' :
        'rgba(255, 128, 0, 0.5)'};
  }
`

const ONGIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange' }>`
  font-size: 48px;
  text-align: center;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 10px ${props => 
    props.color === 'cyan' ? '#00ffff' : 
    props.color === 'pink' ? '#ff00ff' : 
    props.color === 'green' ? '#00ff00' :
    props.color === 'purple' ? '#8000ff' :
    '#ff8000'});
`

const ONGName = styled.h3.withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange' }>`
  color: ${props => 
    props.color === 'cyan' ? '#00ffff' : 
    props.color === 'pink' ? '#ff00ff' : 
    props.color === 'green' ? '#00ff00' :
    props.color === 'purple' ? '#8000ff' :
    '#ff8000'};
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 0 10px currentColor;
`

const ONGDescription = styled.p`
  color: #ffffff;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  text-align: center;
`

const ONGMission = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange' }>`
  color: ${props => 
    props.color === 'cyan' ? '#00ffff' : 
    props.color === 'pink' ? '#ff00ff' : 
    props.color === 'green' ? '#00ff00' :
    props.color === 'purple' ? '#8000ff' :
    '#ff8000'};
  font-size: 12px;
  font-style: italic;
  text-align: center;
  opacity: 0.8;
`

const SelectButton = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange' }>`
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, 
    ${props => 
      props.color === 'cyan' ? '#00ffff, #0080ff' : 
      props.color === 'pink' ? '#ff00ff, #ff0080' : 
      props.color === 'green' ? '#00ff00, #00ff80' :
      props.color === 'purple' ? '#8000ff, #ff00ff' :
      '#ff8000, #ffff00'});
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  color: #000;
  font-weight: bold;
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  text-transform: uppercase;
  transition: all 0.3s ease;
`

const NoResults = styled.div`
  text-align: center;
  color: #ff6b6b;
  font-size: 18px;
  margin-top: 50px;
`

interface Props {
  onSelectONG: (ong: ONG) => void
  onShowGovernance: () => void
}

export default function ONGSelector({ onSelectONG, onShowGovernance }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [ongs, setOngs] = useState<ONG[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchONGs = async () => {
      try {
        setLoading(true)
        const approvedONGs = await apiClient.getApprovedONGs()
        
        // Add color assignment for approved ONGs from database
        const ongsWithColors = approvedONGs.map((ong, index) => ({
          ...ong,
          color: getColorForIndex(index)
        }))
        
        setOngs(ongsWithColors)
      } catch (err) {
        setError('Error al cargar las ONGs disponibles')
        console.error('Error fetching ONGs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchONGs()
  }, [])

  // Assign colors cyclically for visual variety
  const getColorForIndex = (index: number): 'cyan' | 'pink' | 'green' | 'purple' | 'orange' => {
    const colors: ('cyan' | 'pink' | 'green' | 'purple' | 'orange')[] = ['cyan', 'pink', 'green', 'purple', 'orange']
    return colors[index % colors.length]
  }

  const filteredONGs = useMemo(() => {
    return ongs.filter(ong =>
      ong.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ong.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ong.mission.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [ongs, searchTerm])

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>🎯 CARGANDO ONGs 🎯</Title>
          <Subtitle>
            Obteniendo organizaciones disponibles...
          </Subtitle>
        </Header>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', color: '#00ffff' }}
          >
            ⚡
          </motion.div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>🎯 ERROR 🎯</Title>
          <Subtitle style={{ color: '#ff6b6b' }}>
            {error}
          </Subtitle>
        </Header>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 30px',
              background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
              border: 'none',
              borderRadius: '15px',
              color: 'white',
              fontFamily: 'Orbitron, monospace',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>🎯 SELECCIONA TU ONG 🎯</Title>
        <Subtitle>
          Elige la organización que quieres apoyar con tu participación
        </Subtitle>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="🔍 Buscar organización..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon>🔍</SearchIcon>
      </SearchContainer>

      <AnimatePresence>
        <ONGGrid>
          {/* Card de Gobernanza - Siempre primera */}
          <ONGCard
            color="purple"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -10 }}
            onClick={onShowGovernance}
            style={{
              background: 'linear-gradient(135deg, rgba(128, 0, 255, 0.2) 0%, rgba(255, 0, 255, 0.1) 50%, rgba(128, 0, 255, 0.2) 100%)',
              borderColor: '#8000ff'
            }}
          >
            <ONGIcon color="purple">🏛️</ONGIcon>
            <ONGName color="purple">Gobernanza Democrática</ONGName>
            <ONGDescription>
              Participa en la gestión democrática de las ONGs. Vota propuestas y propón nuevas organizaciones.
            </ONGDescription>
            <ONGMission color="purple">
              "El poder de decidir está en tus manos"
            </ONGMission>
            
            <SelectButton
              color="purple"
              initial={{ y: 50, opacity: 0 }}
              whileHover={{ y: -40, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              🗳️ Participar 🗳️
            </SelectButton>
          </ONGCard>

          {/* ONGs regulares */}
          {filteredONGs.length > 0 ? (
            filteredONGs.map((ong, index) => (
              <ONGCard
                key={ong.id}
                color={ong.color}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => onSelectONG(ong)}
              >
                <ONGIcon color={ong.color}>{ong.icon}</ONGIcon>
                <ONGName color={ong.color}>{ong.name}</ONGName>
                <ONGDescription>{ong.description}</ONGDescription>
                <ONGMission color={ong.color}>"{ong.mission}"</ONGMission>
                
                <SelectButton
                  color={ong.color}
                  initial={{ y: 50, opacity: 0 }}
                  whileHover={{ y: -40, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ✨ Seleccionar ✨
                </SelectButton>
              </ONGCard>
            ))
          ) : searchTerm ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              color: '#666', 
              fontSize: '18px',
              marginTop: '40px' 
            }}>
              🔍 No se encontraron ONGs que coincidan con "{searchTerm}"
            </div>
          ) : null}
        </ONGGrid>
      </AnimatePresence>
    </Container>
  )
}