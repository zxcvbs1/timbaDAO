// API client for frontend interactions with the lottery backend

export interface User {
  id: string
  walletAddress: string
  email?: string
  name?: string
  createdAt: Date
  isNew?: boolean
}

export interface GetOrCreateUserResult {
  success: boolean
  user?: User
  message?: string
  error?: string
}

export interface ONG {
  id: string
  name: string
  description: string
  mission: string
  icon: string
  website?: string
  isApproved: boolean
  createdAt?: Date
  color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange' // UI compatibility
}

export interface BetResult {
  success: boolean
  betId?: string
  transactionHash?: string
  message?: string
  error?: string
}

export interface DrawResult {
  success: boolean
  drawId?: string
  winningNumbers?: string
  winners?: string[]
  totalPrize?: number
  message?: string
  error?: string
}

export interface ProposalResult {
  success: boolean
  proposalId?: string
  message?: string
  error?: string
}

export interface VoteResult {
  success: boolean
  message?: string
  error?: string
}

export class LotteryAPIClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  // Game API methods
  async placeBet(userAddress: string, numbers: string, ongId: string, betAmount: number = 100): Promise<BetResult> {
    try {
      // Convert numbers string to array
      const selectedNumbers = numbers.split('').map(n => parseInt(n))
      
      const response = await fetch('/api/game/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userAddress, // Using userAddress as userId for now
          selectedNumbers: selectedNumbers,
          selectedOngId: ongId,
          betAmount: betAmount.toString()
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al realizar la apuesta'
      }
    }
  }

  async executeDrawNumbers(): Promise<DrawResult> {
    try {
      const response = await fetch('/api/game/draw-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al ejecutar el sorteo'
      }
    }
  }

  // Governance API methods
  async proposeONG(userAddress: string, ongData: {
    name: string
    description: string
    mission: string
    icon: string
    website?: string
    walletAddress: string
  }): Promise<ProposalResult> {
    try {
      const response = await fetch('/api/governance/propose-ong', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userAddress, // The API expects userId, not userAddress
          ongData: {
            name: ongData.name,
            description: ongData.description,
            mission: ongData.mission,
            walletAddress: ongData.walletAddress, // Use the wallet address from the form
            website: ongData.website,
            category: 'GENERAL' // Default category, can be mapped from icon
          }
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al proponer ONG'
      }
    }
  }

  async voteOnProposal(userAddress: string, proposalId: string, support: boolean): Promise<VoteResult> {
    try {
      const response = await fetch('/api/governance/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userAddress, // The API expects userId, not userAddress
          proposalId,
          support
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al votar'
      }
    }
  }

  // Data fetching methods
  async getApprovedONGs(): Promise<ONG[]> {
    try {
      const response = await fetch('/api/ongs/approved', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener ONGs aprobadas')
      }

      const data = await response.json()
      return data.ongs || []
    } catch (error) {
      console.error('Error fetching approved ONGs:', error)
      return []
    }
  }

  async getActiveProposals(): Promise<any[]> {
    try {
      const response = await fetch('/api/governance/proposals/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener propuestas activas')
      }

      const data = await response.json()
      return data.proposals || []
    } catch (error) {
      console.error('Error fetching active proposals:', error)
      return []
    }
  }

  // User API methods
  async getOrCreateUser(walletAddress: string, email?: string, name?: string): Promise<GetOrCreateUserResult> {
    try {
      const response = await fetch('/api/users/get-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          email,
          name
        })
      })

      const data = await response.json()
      
      if (data.success && data.data) {
        return {
          success: true,
          user: data.data.user,
          message: data.message
        }
      } else {
        return {
          success: false,
          error: data.error || 'Error al obtener o crear usuario'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener o crear usuario'
      }
    }
  }

  async getUserParticipations(userAddress: string): Promise<number> {
    try {
      const response = await fetch(`/api/users/${userAddress}/participations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener participaciones del usuario')
      }

      const data = await response.json()
      return data.participations || 0
    } catch (error) {
      console.error('Error fetching user participations:', error)
      return 0
    }
  }
}

// Singleton instance
export const apiClient = new LotteryAPIClient()
