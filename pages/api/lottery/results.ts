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

    // 🎲 OBTENER SESIONES DE JUEGO COMPLETADAS (CON NÚMEROS GANADORES)
    const gameSessions = await prisma.gameSession.findMany({
      where: {
        winningNumbers: {
          not: null // Solo juegos que ya fueron sorteados
        }
      },
      include: {
        user: {
          select: {
            id: true
          }
        },
        selectedOng: {
          select: {
            id: true,
            name: true
          }
        }      },
      orderBy: [
        { confirmedAt: 'desc' }, // Primero por fecha de confirmación
        { playedAt: 'desc' }     // Luego por fecha de juego como fallback
      ],      skip: offset,
      take: limitNumber + 1 // +1 para verificar si hay más
    })

    const hasMore = gameSessions.length > limitNumber
    const results = gameSessions.slice(0, limitNumber)

    // 🏆 FORMATEAR RESULTADOS (SIMPLIFICADO - CADA SESIÓN COMO SORTEO INDIVIDUAL)
    console.log('🔍 [API] Processing results, userAddress:', normalizedUserAddress);
    console.log('🔍 [API] Found sessions:', results.map(s => ({ 
      id: s.id, 
      userId: s.user.id,
      selectedNumbers: s.selectedNumbers,
      winningNumbers: s.winningNumbers,
      isWinner: s.isWinner
    })));
    
    const formattedResults = results.map((session, index) => {
      const winners = []
      
      // Si es ganador, añadir a la lista
      if (session.isWinner && session.prizeAmount) {
        const selectedNumbers = session.selectedNumbers?.split(',').map(Number) || []
        const winningNumbers = session.winningNumbers?.split(',').map(Number) || []
        
        // Calcular números coincidentes (solo para números de un dígito)
        const validSelected = selectedNumbers.filter(n => n >= 0 && n <= 9)
        const validWinning = winningNumbers.filter(n => n >= 0 && n <= 9)
        const numbersMatched = validSelected.filter(num => validWinning.includes(num)).length
        
        if (numbersMatched >= 2) { // Solo mostrar si tiene al menos 2 coincidencias
          winners.push({
            address: session.user.id,
            prize: session.prizeAmount,
            numbersMatched,
            betAmount: session.amountPlayed
          })
        }
      }

      // Calcular fondos para ONG (25% del total de apuestas)
      const totalBetsAmount = parseFloat(session.amountPlayed)
      const ongFunds = totalBetsAmount * 0.25      // 👤 INFORMACIÓN DE PARTICIPACIÓN DEL USUARIO
      let userParticipation = null
      
      // Normalizar userAddress (puede ser string o array)
      const normalizedUserAddress = Array.isArray(userAddress) ? userAddress[0] : userAddress;
      
      console.log('🔍 [API] Checking user participation:', {
        userAddress: normalizedUserAddress,
        sessionUserId: session.user.id,
        normalizedUserAddress: normalizedUserAddress?.toLowerCase(),
        normalizedSessionUserId: session.user.id?.toLowerCase()
      });
      
      // Comparación más flexible - comparar tanto exacto como normalizado
      const isUserSession = normalizedUserAddress && (
        session.user.id === normalizedUserAddress ||
        session.user.id?.toLowerCase() === normalizedUserAddress?.toLowerCase()
      );
        if (isUserSession) {
        const userSelectedNumbers = session.selectedNumbers?.split(',').map(Number).filter(n => n >= 0 && n <= 9) || []
        const winningNumbers = session.winningNumbers?.split(',').map(Number).filter(n => n >= 0 && n <= 9) || []
        
        // 🔥 CALCULAR COINCIDENCIAS CORRECTAMENTE: NÚMERO Y POSICIÓN DEBEN COINCIDIR
        let userNumbersMatched = 0;
        const minLength = Math.min(userSelectedNumbers.length, winningNumbers.length);
        
        for (let i = 0; i < minLength; i++) {
          if (userSelectedNumbers[i] === winningNumbers[i]) {
            userNumbersMatched++;
          }
        }
        
        console.log('✅ [API] User participated!', {
          selectedNumbers: userSelectedNumbers,
          winningNumbers,
          numbersMatched: userNumbersMatched,
          comparison: userSelectedNumbers.map((num, idx) => ({
            position: idx,
            selected: num,
            winning: winningNumbers[idx],
            match: num === winningNumbers[idx]
          }))
        });
        
        userParticipation = {
          participated: true,
          selectedNumbers: userSelectedNumbers,
          numbersMatched: userNumbersMatched,
          betAmount: session.amountPlayed,
          won: session.isWinner && userNumbersMatched >= 2,
          prizeWon: session.isWinner ? session.prizeAmount : '0'
        }
      }

      return {
        id: session.id,
        drawNumber: index + 1,
        drawDate: session.confirmedAt || session.playedAt,
        winningNumbers: session.winningNumbers?.split(',').map(Number).filter(n => n >= 0 && n <= 9) || [],
        totalBets: 1,
        totalPrizePool: (parseFloat(session.amountPlayed) * 0.8).toString(), // 80% va al pozo
        winners: winners,
        userParticipation, // 🔥 NUEVA INFORMACIÓN DEL USUARIO
        ongBeneficiary: session.selectedOng ? {
          name: session.selectedOng.name,
          fundsReceived: ongFunds.toFixed(4)
        } : undefined
      }
    })

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
