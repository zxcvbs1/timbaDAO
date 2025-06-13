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
  // betId?: string // Previous structure
  transactionHash?: string
  message?: string
  error?: string
  data?: { // Corrected structure based on API response
    gameId: string;
    transactionHash?: string; // Duplicated here for completeness if needed, but primary is top-level
    blockNumber?: number;
    contributionAmount?: string;
    poolContribution?: string;
    gasUsed?: number;
  };
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

  // Helper method for resilient API calls with retry logic
  private async fetchWithRetry(url: string, options: RequestInit, retries: number = 3): Promise<Response> {
    // For browser environment, use relative URLs directly
    const fullUrl = typeof window !== 'undefined' ? url : `${this.baseUrl}${url}`
    
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`API call attempt ${i + 1}/${retries} to: ${fullUrl}`)
        const response = await fetch(fullUrl, {
          ...options,
          // Add some default options for browser compatibility
          credentials: 'same-origin',
        })
        
        if (!response.ok) {
          console.error(`HTTP ${response.status}: ${response.statusText}`)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        console.log(`API call successful on attempt ${i + 1}`)
        return response
      } catch (error) {
        console.warn(`API call attempt ${i + 1}/${retries} failed:`, error)
        
        if (i === retries - 1) {
          // Last attempt, throw the error
          throw new Error(`Failed after ${retries} attempts: ${error instanceof Error ? error.message : 'Network error'}`)
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(Math.pow(2, i) * 1000, 5000) // Max 5 seconds
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('This should never be reached')
  }
  // Game API methods
  async placeBet(userAddress: string, numbers: number[], ongId: string, betAmount: number = 1000000000000000000): Promise<BetResult> {
    try {
      // 🔥 NEW: Handle single number array for 0-99 range
      const selectedNumbers = numbers // Already an array of numbers
      
      const response = await this.fetchWithRetry('/api/game/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userAddress,
          selectedNumbers: selectedNumbers,
          selectedOngId: ongId,
          betAmount: betAmount.toString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error [placeBet]:', response.status, errorText)
        return {
          success: false,
          error: `API Error: ${response.status} - ${errorText.substring(0, 100)}...`,
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.error('API Error [placeBet]: Expected JSON, got', contentType, responseText)
        return {
          success: false,
          error: `Expected JSON, got ${contentType}. Response: ${responseText.substring(0, 100)}...`,
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Network/JSON Parse Error [placeBet]:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al realizar la apuesta'
      }
    }
  }

  async executeDrawNumbers(force: boolean = false): Promise<DrawResult> {
    try {
      const response = await this.fetchWithRetry('/api/game/draw-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error [executeDrawNumbers]:', response.status, errorText)
        return {
          success: false,
          error: `API Error: ${response.status} - ${errorText.substring(0, 100)}...`,
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.error('API Error [executeDrawNumbers]: Expected JSON, got', contentType, responseText)
        return {
          success: false,
          error: `Expected JSON, got ${contentType}. Response: ${responseText.substring(0, 100)}...`,
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Network/JSON Parse Error [executeDrawNumbers]:', error)
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
      const response = await this.fetchWithRetry('/api/governance/propose-ong', {
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
      const response = await this.fetchWithRetry('/api/governance/vote', {
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
      const response = await this.fetchWithRetry('/api/ongs/approved', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error [getApprovedONGs]:', response.status, errorText)
        // Instead of throwing, return empty or an error structure if preferred by calling code
        return [] 
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.error('API Error [getApprovedONGs]: Expected JSON, got', contentType, responseText)
        return [] // Or handle as an error
      }

      const data = await response.json()
      return data.ongs || []
    } catch (error) {
      console.error('Network/JSON Parse Error [getApprovedONGs]:', error)
      return []
    }
  }

  async getActiveProposals(): Promise<any[]> {
    try {
      const response = await this.fetchWithRetry('/api/governance/proposals/active', {
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
      const response = await this.fetchWithRetry('/api/users/get-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, email, name }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error [getOrCreateUser]:', response.status, errorText)
        return {
          success: false,
          error: `API Error: ${response.status} - ${errorText.substring(0, 100)}...`, // Return a snippet of the error
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.error('API Error [getOrCreateUser]: Expected JSON, got', contentType, responseText)
        return {
          success: false,
          error: `Expected JSON, got ${contentType}. Response: ${responseText.substring(0, 100)}...`,
        }
      }

      const data = await response.json()
      
      // Transform the API response to match the expected interface
      if (data.success && data.data && data.data.user) {
        return {
          success: true,
          user: data.data.user,
          message: data.message
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Failed to get or create user'
        }
      }
    } catch (error) {
      console.error('Network/JSON Parse Error [getOrCreateUser]:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener o crear usuario',
      }
    }
  }

  async getUserParticipations(userAddress: string): Promise<number> {
    try {
      const response = await this.fetchWithRetry(`/api/users/${userAddress}/participations`, {
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
