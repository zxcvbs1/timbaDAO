import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface LotteryResultsResponse {
  success: boolean
  results?: any[]
  hasMore?: boolean
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

    // Normalizar userAddress (puede ser string o array)
    const normalizedUserAddress = Array.isArray(userAddress) ? userAddress[0] : userAddress;

    console.log('🔍 [API] Fetching lottery results:', {
      page: pageNumber,
      limit: limitNumber,
      userAddress: normalizedUserAddress
    })

    // 🔢 OBTENER EL TOTAL DE SORTEOS PARA CALCULAR NÚMEROS CORRECTOS
    const totalCount = await prisma.gameSession.count({
      where: {
        winningNumbers: {
          not: null // Solo juegos que ya fueron sorteados
        }
      }
    })

    // 🎲 OBTENER SESIONES DE JUEGO COMPLETADAS (CON NÚMEROS GANADORES)
    const gameSessions = await prisma.gameSession.findMany({
      where: {
        winningNumbers: {
          not: null // Solo juegos que ya fueron sorteados
        }
      },
      orderBy: {
        confirmedAt: 'desc' // Más recientes primero
      },
      skip: offset,
      take: limitNumber,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        selectedOng: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    // 🔄 AGRUPAR POR NÚMEROS GANADORES ÚNICOS (simulando sorteos únicos)
    const uniqueDraws = new Map()
    
    gameSessions.forEach(session => {
      const winningKey = session.winningNumbers
      if (!uniqueDraws.has(winningKey)) {
        uniqueDraws.set(winningKey, {
          winningNumbers: winningKey,
          sessions: [],
          confirmedAt: session.confirmedAt
        })
      }
      uniqueDraws.get(winningKey).sessions.push(session)
    })

    const results = Array.from(uniqueDraws.values())
      .sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime())

    console.log('🎯 [API] Processing results:', {
      totalSessions: gameSessions.length,
      uniqueDraws: results.length,
      sampleResults: results.slice(0, 3).map(r => ({
        winningNumbers: r.winningNumbers,
        sessionsCount: r.sessions.length
      }))
    })

    // 🔢 CALCULAR EL NÚMERO DE SORTEO BASADO EN LA POSICIÓN TOTAL
    const totalResults = results.length
    
    const formattedResults = results.map((draw, index) => {
      const winners = []
      
      // 🎯 CALCULAR DRAW NUMBER CORRECTAMENTE (MÁS RECIENTE = NÚMERO MÁS ALTO)
      const drawNumber = totalCount - (pageNumber * limitNumber) - index
      
      // 🔥 NEW: Parse winning number for single number system
      const winningNumber = draw.winningNumbers ? parseInt(draw.winningNumbers) : null
      
      // Process all sessions for this draw
      draw.sessions.forEach(session => {
        // Si es ganador, añadir a la lista
        if (session.isWinner && session.prizeAmount) {
          // 🔥 NEW: Handle single number format
          const selectedNumber = session.selectedNumbers ? parseInt(session.selectedNumbers) : null
          
          // Only show as winner if exact match
          if (selectedNumber !== null && winningNumber !== null && selectedNumber === winningNumber) {
            winners.push({
              address: session.user.id,
              prize: session.prizeAmount,
              numbersMatched: 1, // Always 1 for exact match in single number system
              betAmount: session.amountPlayed
            })
          }
        }
      })

      // Calcular fondos para ONG (25% del total de apuestas)
      const totalBetsAmount = draw.sessions.reduce((sum, session) => sum + parseFloat(session.amountPlayed), 0)
      const ongFunds = totalBetsAmount * 0.25

      // 👤 INFORMACIÓN DE PARTICIPACIÓN DEL USUARIO
      let userParticipation = null
      
      if (normalizedUserAddress) {
        // Find user's session in this draw
        const userSession = draw.sessions.find(session => 
          session.user.id === normalizedUserAddress ||
          session.user.id?.toLowerCase() === normalizedUserAddress?.toLowerCase()
        )
        
        if (userSession) {
          // 🔥 NEW: Handle single number format (0-99)
          const userSelectedNumber = userSession.selectedNumbers ? parseInt(userSession.selectedNumbers) : null
          
          // Calculate matches - either exact match (1) or no match (0)
          const userNumbersMatched = (userSelectedNumber !== null && winningNumber !== null && userSelectedNumber === winningNumber) ? 1 : 0;
          
          console.log('✅ [API] User participated!', {
            selectedNumber: userSelectedNumber,
            winningNumber: winningNumber,
            numbersMatched: userNumbersMatched,
            isExactMatch: userSelectedNumber === winningNumber
          });
          
          userParticipation = {
            participated: true,
            selectedNumbers: userSelectedNumber !== null ? [userSelectedNumber] : [], // Convert to array for compatibility
            numbersMatched: userNumbersMatched,
            betAmount: userSession.amountPlayed,
            won: userSession.isWinner && userNumbersMatched === 1, // Must be exact match to win
            prizeWon: userSession.isWinner ? userSession.prizeAmount : '0'
          }
        }
      }

      // Use the first session for ONG beneficiary info
      const firstSession = draw.sessions[0]

      return {
        id: `draw_${drawNumber}`,
        drawNumber: drawNumber,
        drawDate: draw.confirmedAt,
        winningNumbers: winningNumber !== null ? [winningNumber] : [], // 🔥 NEW: Single number array
        totalBets: draw.sessions.length,
        totalPrizePool: (totalBetsAmount * 0.8).toString(), // 80% va al pozo
        winners: winners,
        userParticipation, // 🔥 NUEVA INFORMACIÓN DEL USUARIO
        ongBeneficiary: firstSession?.selectedOng ? {
          name: firstSession.selectedOng.name,
          fundsReceived: ongFunds.toFixed(4)
        } : undefined
      }
    })

    // 🔄 VERIFICAR SI HAY MÁS RESULTADOS
    const hasMore = (pageNumber + 1) * limitNumber < totalResults

    console.log('✅ [API] Lottery results fetched successfully:', {
      resultsCount: formattedResults.length,
      hasMore
    })

    return res.status(200).json({
      success: true,
      results: formattedResults,
      hasMore
    })

  } catch (error) {
    console.error('❌ [API] Error fetching lottery results:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch lottery results'
    })
  }
}
