// Componente para funcionalidades de governance
'use client'
import { useState, useEffect } from 'react'
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

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  gap: 20px;
`

const Tab = styled(motion.button)<{ active: boolean }>`
  padding: 15px 30px;
  background: ${props => props.active ? 
    'linear-gradient(45deg, #ff00ff, #00ffff)' : 
    'rgba(0, 0, 0, 0.3)'};
  border: 3px solid ${props => props.active ? '#00ffff' : '#666'};
  border-radius: 15px;
  color: ${props => props.active ? '#000' : '#fff'};
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
`

const Section = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #00ffff;
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  color: #00ffff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`

const Input = styled.input`
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #666;
  border-radius: 10px;
  padding: 15px;
  color: #fff;
  font-family: 'Orbitron', monospace;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #666;
  border-radius: 10px;
  padding: 15px;
  color: #fff;
  font-family: 'Orbitron', monospace;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const Select = styled.select`
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #666;
  border-radius: 10px;
  padding: 15px;
  color: #fff;
  font-family: 'Orbitron', monospace;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }

  option {
    background: #000;
    color: #fff;
  }
`

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  padding: 15px 30px;
  background: ${props => 
    props.variant === 'secondary' 
      ? 'linear-gradient(45deg, #666, #999)' 
      : 'linear-gradient(45deg, #ff00ff, #00ffff)'};
  border: none;
  border-radius: 15px;
  color: ${props => props.variant === 'secondary' ? '#fff' : '#000'};
  font-family: 'Orbitron', monospace;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-right: 15px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ProposalCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #666;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ffff;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  }
`

const ProposalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`

const ProposalTitle = styled.h3`
  color: #00ffff;
  font-size: 20px;
  margin: 0;
`

const ProposalStatus = styled.span<{ status: string }>`
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  background: ${props => 
    props.status === 'VOTING' ? 'rgba(0, 255, 255, 0.2)' :
    props.status === 'APPROVED' ? 'rgba(0, 255, 0, 0.2)' :
    'rgba(255, 0, 0, 0.2)'};
  color: ${props => 
    props.status === 'VOTING' ? '#00ffff' :
    props.status === 'APPROVED' ? '#00ff00' :
    '#ff0000'};
`

const VoteSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
`

const VoteStats = styled.div`
  color: #fff;
  font-size: 14px;
`

const VoteButtons = styled.div`
  display: flex;
  gap: 10px;
`

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  border-radius: 10px;
  padding: 15px;
  color: #ff0000;
  margin-bottom: 20px;
  text-align: center;
`

const SuccessMessage = styled.div`
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  border-radius: 10px;
  padding: 15px;
  color: #00ff00;
  margin-bottom: 20px;
  text-align: center;
`

interface Props {
  onBack: () => void
  userAddress?: string
}

export default function GovernancePanel({ onBack, userAddress = "0x1234567890abcdef1234567890abcdef12345678" }: Props) {
  const [activeTab, setActiveTab] = useState<'vote' | 'propose'>('vote')
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userParticipations, setUserParticipations] = useState(0)

  // Form states
  const [proposalForm, setProposalForm] = useState({
    name: '',
    description: '',
    mission: '',
    website: '',
    walletAddress: '',
    icon: '🏥'
  })

  useEffect(() => {
    loadProposals()
    loadUserParticipations()
  }, [])

  const loadProposals = async () => {
    try {
      setLoading(true)
      const activeProposals = await apiClient.getActiveProposals()
      setProposals(activeProposals)
    } catch (err) {
      setError('Error al cargar propuestas')
    } finally {
      setLoading(false)
    }
  }

  const loadUserParticipations = async () => {
    try {
      const participations = await apiClient.getUserParticipations(userAddress)
      setUserParticipations(participations)
    } catch (err) {
      console.error('Error loading user participations:', err)
    }
  }

  const handleProposeONG = async () => {
    setError(null)
    setSuccess(null)

    if (!proposalForm.name || !proposalForm.description || !proposalForm.mission || !proposalForm.walletAddress) {
      setError('Por favor completa todos los campos obligatorios (*, incluyendo wallet address)')
      return
    }

    // Validar formato de wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(proposalForm.walletAddress)) {
      setError('La dirección de wallet debe ser una dirección Ethereum válida (0x seguido de 40 caracteres hexadecimales)')
      return
    }

    if (userParticipations < 10) {
      setError(`Necesitas al menos 10 participaciones para proponer una ONG. Tienes: ${userParticipations}`)
      return
    }

    try {
      setLoading(true)
      const result = await apiClient.proposeONG(userAddress, proposalForm)
      
      if (result.success) {
        setSuccess('🎉 Propuesta creada exitosamente! Los usuarios podrán votar durante los próximos 7 días.')
        setProposalForm({ name: '', description: '', mission: '', website: '', walletAddress: '', icon: '🏥' })
        await loadProposals()
      } else {
        setError(result.error || 'Error al crear la propuesta')
      }
    } catch (err) {
      setError('Error de conexión al crear la propuesta')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (proposalId: string, support: boolean) => {
    setError(null)
    setSuccess(null)

    if (userParticipations < 3) {
      setError(`Necesitas al menos 3 participaciones para votar. Tienes: ${userParticipations}`)
      return
    }

    try {
      setLoading(true)
      const result = await apiClient.voteOnProposal(userAddress, proposalId, support)
      
      if (result.success) {
        setSuccess(`✅ Voto registrado: ${support ? 'A FAVOR' : 'EN CONTRA'}`)
        await loadProposals()
      } else {
        setError(result.error || 'Error al registrar el voto')
      }
    } catch (err) {
      setError('Error de conexión al votar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Header>
        <Title>🗳️ GOVERNANCE DEMOCRÁTICO 🗳️</Title>
        <Subtitle>
          Participa en la gestión democrática de las ONGs
        </Subtitle>
        <div style={{ color: '#ffff00', fontSize: '14px' }}>
          Tus participaciones: {userParticipations} 
          {userParticipations >= 10 && ' ✅ Puedes proponer ONGs'}
          {userParticipations >= 3 && userParticipations < 10 && ' ✅ Puedes votar'}
          {userParticipations < 3 && ' ❌ Necesitas más participaciones'}
        </div>
      </Header>

      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          background: 'linear-gradient(45deg, #666, #999)',
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          fontFamily: 'Orbitron, monospace',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        ← Volver al Juego
      </button>

      <TabContainer>
        <Tab
          active={activeTab === 'vote'}
          onClick={() => setActiveTab('vote')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🗳️ Votar Propuestas
        </Tab>
        <Tab
          active={activeTab === 'propose'}
          onClick={() => setActiveTab('propose')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ➕ Proponer ONG
        </Tab>
      </TabContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <AnimatePresence mode="wait">
        {activeTab === 'vote' && (
          <motion.div
            key="vote"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <Section>
              <h2 style={{ color: '#00ffff', textAlign: 'center', marginBottom: '30px' }}>
                📊 Propuestas Activas para Votar
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', color: '#00ffff' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ fontSize: '48px', marginBottom: '20px' }}
                  >
                    ⚡
                  </motion.div>
                  Cargando propuestas...
                </div>
              ) : proposals.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>
                  📭 No hay propuestas activas en este momento
                </div>
              ) : (
                proposals.map((proposal, index) => (
                  <ProposalCard
                    key={proposal.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProposalHeader>
                      <ProposalTitle>{proposal.icon} {proposal.name}</ProposalTitle>
                      <ProposalStatus status={proposal.status}>
                        {proposal.status}
                      </ProposalStatus>
                    </ProposalHeader>
                    
                    <div style={{ color: '#fff', marginBottom: '10px' }}>
                      {proposal.description}
                    </div>
                    
                    <div style={{ color: '#00ffff', fontStyle: 'italic', marginBottom: '15px' }}>
                      "{proposal.mission}"
                    </div>

                    <VoteSection>
                      <VoteStats>
                        <div>👍 A favor: {proposal.votesFor || 0}</div>
                        <div>👎 En contra: {proposal.votesAgainst || 0}</div>
                      </VoteStats>
                      
                      <VoteButtons>
                        <Button
                          variant="secondary"
                          onClick={() => handleVote(proposal.id, true)}
                          disabled={loading || userParticipations < 3}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          👍 A Favor
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleVote(proposal.id, false)}
                          disabled={loading || userParticipations < 3}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          👎 En Contra
                        </Button>
                      </VoteButtons>
                    </VoteSection>
                  </ProposalCard>
                ))
              )}
            </Section>
          </motion.div>
        )}

        {activeTab === 'propose' && (
          <motion.div
            key="propose"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Section>
              <h2 style={{ color: '#00ffff', textAlign: 'center', marginBottom: '30px' }}>
                ➕ Proponer Nueva ONG
              </h2>
              
              {userParticipations < 10 && (
                <div style={{ 
                  background: 'rgba(255, 255, 0, 0.1)', 
                  border: '1px solid #ffff00', 
                  borderRadius: '10px', 
                  padding: '15px', 
                  marginBottom: '20px',
                  textAlign: 'center',
                  color: '#ffff00'
                }}>
                  ⚠️ Necesitas al menos 10 participaciones para proponer una ONG. 
                  <br />¡Juega más para desbloquear esta funcionalidad!
                </div>
              )}

              <FormGroup>
                <Label>🏥 Icono</Label>
                <Select
                  value={proposalForm.icon}
                  onChange={(e) => setProposalForm({ ...proposalForm, icon: e.target.value })}
                >
                  <option value="🏥">🏥 Salud</option>
                  <option value="🎓">🎓 Educación</option>
                  <option value="🌱">🌱 Medio Ambiente</option>
                  <option value="👶">👶 Niños</option>
                  <option value="🐕">🐕 Animales</option>
                  <option value="👴">👴 Adultos Mayores</option>
                  <option value="💻">💻 Tecnología</option>
                  <option value="🎨">🎨 Arte y Cultura</option>
                  <option value="⚽">⚽ Deportes</option>
                  <option value="🤝">🤝 Acción Social</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>📝 Nombre de la ONG *</Label>
                <Input
                  type="text"
                  placeholder="Ej: Fundación Esperanza"
                  value={proposalForm.name}
                  onChange={(e) => setProposalForm({ ...proposalForm, name: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>📄 Descripción *</Label>
                <TextArea
                  placeholder="Describe qué hace la organización y cómo ayuda..."
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>🎯 Misión *</Label>
                <TextArea
                  placeholder="¿Cuál es el objetivo principal de esta ONG?"
                  value={proposalForm.mission}
                  onChange={(e) => setProposalForm({ ...proposalForm, mission: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>💰 Dirección de Wallet *</Label>
                <Input
                  type="text"
                  placeholder="0x1234567890abcdef1234567890abcdef12345678"
                  value={proposalForm.walletAddress}
                  onChange={(e) => setProposalForm({ ...proposalForm, walletAddress: e.target.value })}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  ⚠️ Dirección donde la ONG recibirá las donaciones. Verifica que sea correcta.
                </div>
              </FormGroup>

              <FormGroup>
                <Label>🌐 Sitio Web (opcional)</Label>
                <Input
                  type="url"
                  placeholder="https://ejemplo.org"
                  value={proposalForm.website}
                  onChange={(e) => setProposalForm({ ...proposalForm, website: e.target.value })}
                />
              </FormGroup>

              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Button
                  onClick={handleProposeONG}
                  disabled={loading || userParticipations < 10}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? '⏳ Creando...' : '🚀 Crear Propuesta'}
                </Button>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}
