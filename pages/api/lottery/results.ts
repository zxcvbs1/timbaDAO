import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface TicketResult {
  id: string
  ticketId: string
  playerAddress: string
  selectedNumber: number
  betAmount: string
  contributionAmount: string
  selectedONG: {
    id: string
    name: string
    logo?: string
  }
  playedAt: Date
  winningNumber?: number
  isWinner: boolean
  prizeAmount?: string
  drawId?: string
  status: 'pending' | 'drawn' | 'expired'
}

interface LotteryResultsResponse {
  success: boolean
  results?: TicketResult[]
  hasMore?: boolean
  totalResults?: number
  userResults?: TicketResult[]
  message?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LotteryResultsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { page = '0', limit = '10', userAddress } = req.query

    const pageNumber = parseInt(page as string)
    const limitNumber = parseInt(limit as string)
    const offset = pageNumber * limitNumber

    // Normalizar userAddress
    const normalizedUserAddress = Array.isArray(userAddress) ? userAddress[0] : userAddress;

    console.log('🎫 [API] Fetching lottery ticket results:', {
      page: pageNumber,
      limit: limitNumber,
      userAddress: normalizedUserAddress
    })    // 🎲 OBTENER SESIONES DE JUEGO COMPLETADAS Y PENDIENTES
    const gameSessions = await prisma.gameSession.findMany({
      orderBy: {
        playedAt: 'desc' // Más recientes primero
      },
      skip: offset,
      take: limitNumber,
      include: {
        selectedOng: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    // 🔢 OBTENER TOTAL PARA PAGINACIÓN
    const totalCount = await prisma.gameSession.count()

    // 🎫 CONVERTIR A FORMATO DE TICKETS
    const ticketResults: TicketResult[] = gameSessions.map((session) => {
      const selectedNumber = parseInt(session.selectedNumbers)
      const winningNumber = session.winningNumbers ? parseInt(session.winningNumbers) : undefined
      const isWinner = session.isWinner || false
      
      // Determinar status
      let status: 'pending' | 'drawn' | 'expired' = 'pending'
      if (session.winningNumbers !== null) {
        status = 'drawn'
      } else {
        // Verificar si ha expirado (más de 24 horas)
        const hoursSincePlay = (Date.now() - session.playedAt.getTime()) / (1000 * 60 * 60)
        if (hoursSincePlay > 24) {
          status = 'expired'
        }
      }

      return {
        id: session.id,
        ticketId: `TICKET-${session.id.slice(-8).toUpperCase()}`,
        playerAddress: session.userId,
        selectedNumber,
        betAmount: session.amountPlayed,
        contributionAmount: session.contributionAmount,        selectedONG: {
          id: session.selectedOng.id,
          name: session.selectedOng.name,
          logo: session.selectedOng.icon
        },
        playedAt: session.playedAt,
        winningNumber,
        isWinner,
        prizeAmount: session.prizeAmount || undefined,
        drawId: session.winningNumbers ? `DRAW-${session.confirmedAt?.getTime() || Date.now()}` : undefined,
        status
      }
    })

    // 🎯 FILTRAR RESULTADOS DEL USUARIO SI SE PROPORCIONA UNA DIRECCIÓN
    const userResults = normalizedUserAddress 
      ? ticketResults.filter(ticket => 
          ticket.playerAddress.toLowerCase() === normalizedUserAddress.toLowerCase()
        )
      : []

    const hasMore = (offset + limitNumber) < totalCount

    console.log(`✅ [API] Returning ${ticketResults.length} ticket results (${userResults.length} for user)`)

    return res.status(200).json({
      success: true,
      results: ticketResults,
      userResults,
      hasMore,
      totalResults: totalCount
    })

  } catch (error) {
    console.error('❌ [API] Error fetching lottery results:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener resultados'
    })
  }
}