// 🎭 FUNCIONALIDAD: Simula completamente el contrato de lotería
// Permite desarrollar sin smart contract real, manteniendo toda la lógica

import { prisma } from '../prisma';
import { defaultBlockchainConfig } from './config';
import { validateLotteryNumbers, validateNumberAvailability } from '../validations';
import type { 
  ILotteryContract, 
  GameResult, 
  DrawResult, 
  Winner 
} from './interfaces';

export class MockLotteryContract implements ILotteryContract {
  private config = defaultBlockchainConfig;

  // 🎰 FUNCIÓN PRINCIPAL: APOSTAR
  async placeBet(
    userId: string,
    selectedNumbers: number[],
    selectedOngId: string,
    betAmount: string
  ): Promise<GameResult> {
    // Normalize userId to lowercase for consistency with user creation
    const normalizedUserId = userId.toLowerCase();
    
    console.log('🎰 [MOCK] Placing bet:', {
      userId,
      normalizedUserId,
      selectedNumbers,
      selectedOngId,
      betAmount: `${betAmount} wei`
    });

    try {
      // 🔍 VALIDACIONES
      await this.validateBet(normalizedUserId, selectedNumbers, selectedOngId, betAmount);

      // 🎯 GENERAR DATOS MOCK
      const mockTxHash = this.generateMockTxHash();
      const mockBlockNumber = this.generateMockBlockNumber();
      
      // 💰 CALCULAR DISTRIBUCIÓN
      const distribution = this.calculateFundDistribution(betAmount);      // 📝 CREAR SESIÓN DE JUEGO - NUEVO FORMATO
      const gameSession = await prisma.gameSession.create({
        data: {
          userId: normalizedUserId, // Use normalized userId
          selectedOngId,
          selectedNumbers: selectedNumbers[0].toString(), // Solo un número como string
          amountPlayed: betAmount,
          contributionPercentage: this.config.ongPercentage,
          contributionAmount: distribution.ongShare,
          gameTransactionHash: mockTxHash,
          blockNumber: BigInt(mockBlockNumber),
          playedAt: new Date()
        }
      });      // 🔄 ACTUALIZAR TOTALES
      await this.updateUserTotals(normalizedUserId, betAmount, distribution.ongShare);
      await this.updateONGTotals(selectedOngId, distribution.ongShare);

      console.log('✅ [MOCK] Bet placed successfully');

      return {
        gameId: gameSession.id,
        transactionHash: mockTxHash,
        blockNumber: mockBlockNumber,
        success: true,
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
        contributionAmount: distribution.ongShare,
        poolContribution: distribution.poolAmount
      };

    } catch (error) {
      console.error('❌ [MOCK] Error placing bet:', error);
      throw error;
    }
  }
  // 🎲 SORTEO DE NÚMEROS
  async drawNumbers(force: boolean = false, specificNumbers?: number[]): Promise<DrawResult> {
    console.log('🎲 [MOCK] Drawing numbers...', { force, specificNumbers });

    try {
      const pendingGames = await this.getPendingGames(force);
      
      // ELIMINADO: Ya NO verificamos minPlayersForDraw en absoluto
      console.log(`🎲 [MOCK] Found ${pendingGames.length} pending games. Proceeding with draw...`);

      if (pendingGames.length === 0) {
        // Crear un sorteo vacío si no hay juegos
        console.log(`🔧 [MOCK] No pending games - creating empty draw.`);
        const winningNumbersGenerated = specificNumbers || this.generateWinningNumbers();
        const drawId = `draw_${Date.now()}`;
        
        return {
          winningNumbers: winningNumbersGenerated,
          winners: [],
          transactionHash: this.generateMockTxHash(),
          totalPrizePool: '0',
          drawId
        };
      }

      const winningNumbers = specificNumbers || this.generateWinningNumbers();
      console.log('🎯 [MOCK] Winning numbers:', winningNumbers);

      // findWinners now returns richer objects, including ticketId, numbers, player
      const winnersFromFind = await this.findWinners(pendingGames, winningNumbers);
      console.log('👑 [MOCK] Winners found by findWinners:', winnersFromFind.length);

      const totalPrizePool = await this.getCurrentPool();
      // distributePrizes updates prizeAmount on the winner objects in winnersFromFind array
      await this.distributePrizes(winnersFromFind, totalPrizePool, winningNumbers);
      await this.markLosingGames(pendingGames, winnersFromFind, winningNumbers);

      const drawId = `draw_${Date.now()}`;

      return {
        winningNumbers,
        winners: winnersFromFind.map(w => ({ // Ensure all Winner interface fields are mapped
          userId: w.userId,
          gameId: w.gameId,
          prizeAmount: w.prizeAmount, // Updated by distributePrizes
          matchedNumbers: w.matchedNumbers,
          ticketId: w.ticketId,       // Added from findWinners
          numbers: w.numbers,       // Added from findWinners
          player: w.player          // Added from findWinners
        })),
        transactionHash: this.generateMockTxHash(),
        totalPrizePool,
        drawId
      };

    } catch (error) {
      console.error('❌ [MOCK] Error in draw:', error);
      throw error;
    }
  }

  // 📊 GETTERS
  async getCurrentPool(): Promise<string> {
    // Since we can't aggregate string fields directly, we'll fetch all records and sum manually
    const games = await prisma.gameSession.findMany({
      where: { winningNumbers: null },
      select: { amountPlayed: true }
    });    const totalPlayed = games.reduce((sum, game) => {
      const amountBigInt = BigInt(Math.floor(parseFloat(game.amountPlayed)));
      return sum + amountBigInt;
    }, BigInt(0));
    const poolAmount = (totalPlayed * BigInt(this.config.poolPercentage)) / BigInt(100);
    
    return poolAmount.toString();
  }

  async getONGFunds(ongId: string): Promise<string> {
    const ong = await prisma.approvedONG.findUnique({
      where: { id: ongId },
      select: { totalFundsReceived: true }
    });
    
    return ong?.totalFundsReceived || '0';
  }

  async getUserWinnings(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalWinnings: true }
    });
    
    return user?.totalWinnings || '0';
  }

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalAmountPlayed: true,
        totalWinnings: true,
        totalContributed: true,
        participations: true,
        totalGamesWon: true
      }
    });

    if (!user) {
      return {
        totalPlayed: '0',
        totalWon: '0',
        totalContributed: '0',
        gamesPlayed: 0,
        gamesWon: 0
      };
    }

    return {
      totalPlayed: user.totalAmountPlayed,
      totalWon: user.totalWinnings,
      totalContributed: user.totalContributed,
      gamesPlayed: user.participations,
      gamesWon: user.totalGamesWon
    };
  }

  async getGameById(gameId: string): Promise<any> {
    return await prisma.gameSession.findUnique({
      where: { id: gameId },
      include: {
        user: { select: { id: true, email: true, participations: true } },
        selectedOng: true
      }
    });
  }

  async setMinPlayersForDraw(count: number): Promise<void> {
    this.config.minPlayersForDraw = count;
    console.log(`🔧 [MOCK] Min players set to: ${count}`);
  }

  async triggerDraw(specificNumbers?: number[]): Promise<DrawResult> {
    console.log('🎯 [MOCK] Admin triggered draw with specificNumbers:', specificNumbers);
    
    try {
      // Para testing, simplificamos el proceso - solo generar números y simular resultado
      const winningNumbers = specificNumbers || this.generateWinningNumbers();
      const drawId = `admin_draw_${Date.now()}`;
      
      // Obtener juegos pendientes de manera simple
      const pendingGames = await prisma.gameSession.findMany({
        where: { winningNumbers: null },
        take: 100 // Limitar para evitar problemas de memoria
      });
      
      console.log(`🎲 [MOCK] Found ${pendingGames.length} pending games`);
        // Buscar ganadores de manera simple
      const winners = [];
      for (const game of pendingGames) {
        const selectedNumber = parseInt(game.selectedNumbers); // Solo un número
        const winningNumber = winningNumbers[0]; // Solo un número ganador
        
        // Verificar si hay coincidencia exacta
        const isWinner = selectedNumber === winningNumber;
        
        if (isWinner) {
          winners.push({
            userId: game.userId,
            gameId: game.id,
            prizeAmount: '1000000000000000000', // Premio fijo para testing
            matchedNumbers: 1, // Siempre 1 en el nuevo sistema
            walletAddress: game.userId, // Usar userId como wallet address
            // Propiedades adicionales para eventos en tiempo real
            ticketId: game.id,
            numbers: [selectedNumber],
            player: game.userId
          });
        }
      }
      
      console.log(`👑 [MOCK] Found ${winners.length} winners`);
        // Actualizar los juegos de manera simple
      await prisma.gameSession.updateMany({
        where: { winningNumbers: null },
        data: {
          winningNumbers: winningNumbers[0].toString(), // Solo un número
          isWinner: false,
          confirmedAt: new Date()
        }
      });
      
      // Actualizar ganadores específicamente
      for (const winner of winners) {
        await prisma.gameSession.update({
          where: { id: winner.gameId },
          data: {
            isWinner: true,
            prizeAmount: winner.prizeAmount
          }
        });
      }
      
      console.log('✅ [MOCK] Draw completed successfully');
      
      return {
        winningNumbers,
        winners,
        transactionHash: this.generateMockTxHash(),
        totalPrizePool: (BigInt(winners.length) * BigInt('1000000000000000000')).toString(),
        drawId,
        totalTickets: pendingGames.length
      };
      
    } catch (error: any) {
      console.error('❌ [MOCK] Error in triggerDraw:', error);
      throw new Error(`Draw failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async getDrawHistory(limit: number = 10): Promise<DrawResult[]> {
    // En mock, retornamos array vacío por ahora
    return [];
  }

  // ===== MÉTODOS PRIVADOS =====
  private async validateBet(
    userId: string, 
    selectedNumbers: number[], 
    selectedOngId: string, 
    betAmount: string
  ) {
    // Validar números
    const numbersValidation = validateLotteryNumbers(selectedNumbers);
    if (!numbersValidation.isValid) {
      throw new Error(numbersValidation.message);
    }

    // 🔥 NUEVO: Validar que el número no esté tomado
    if (selectedNumbers.length === 1) {
      const availabilityValidation = await validateNumberAvailability(selectedNumbers[0], userId);
      if (!availabilityValidation.isValid) {
        throw new Error(availabilityValidation.message);
      }
    }

    // Validar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`Usuario con ID ${userId} no existe. Asegúrate de que el usuario se haya creado correctamente.`);
    }

    // Validar ONG existe y está activa
    const ong = await prisma.approvedONG.findUnique({
      where: { id: selectedOngId, isActive: true }
    });

    if (!ong) {
      throw new Error('La ONG seleccionada no existe o no está activa');
    }

    // Validar monto mínimo
    const minBet = BigInt(this.config.defaultBetAmount);
    if (BigInt(betAmount) < minBet) {
      throw new Error(`El monto mínimo es ${minBet} wei`);
    }
  }

  private calculateFundDistribution(betAmount: string) {
    const betAmountBN = BigInt(betAmount);
    const ongShare = (betAmountBN * BigInt(this.config.ongPercentage)) / BigInt(100);
    const ownerCommission = (betAmountBN * BigInt(this.config.ownerPercentage)) / BigInt(100);
    const poolAmount = betAmountBN - ongShare - ownerCommission;

    return {
      ongShare: ongShare.toString(),
      ownerCommission: ownerCommission.toString(),
      poolAmount: poolAmount.toString()
    };
  }

  private generateMockTxHash(): string {
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  private generateMockBlockNumber(): number {
    return Math.floor(Math.random() * 1000000) + 1000000;
  }
  private generateWinningNumbers(): number[] {
    // Para el nuevo sistema, solo generamos UN número entre 0-99
    const winningNumber = Math.floor(Math.random() * (this.config.numbersRange + 1));
    return [winningNumber];
  }

  public async getPendingGames(force: boolean = false) {
    const whereCondition: any = {
      winningNumbers: null
    };

    // If not forcing, only include games from last 24 hours
    if (!force) {
      whereCondition.playedAt = {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
      };
    }

    return await prisma.gameSession.findMany({
      where: whereCondition,
      include: {
        user: { select: { id: true, email: true } },
        selectedOng: { select: { id: true, name: true } }
      }
    });
  }  private async findWinners(games: any[], winningNumbers: number[]) {
    const winners = [];
    const winningNumber = winningNumbers[0]; // Solo un número ganador

    for (const game of games) {
      const selectedNumber = parseInt(game.selectedNumbers); // Convertir string a número
      
      console.log(`🎯 [MOCK] Game ${game.id}: Selected: ${selectedNumber}, Winning: ${winningNumber}`);
      
      if (selectedNumber === winningNumber) {
        winners.push({
          userId: game.userId,
          gameId: game.id,
          matchedNumbers: 1, 
          prizeAmount: '0', // Placeholder, updated by distributePrizes
          ticketId: game.id, // Added for Winner interface compatibility
          numbers: [selectedNumber], // Added for Winner interface compatibility
          player: game.userId // Added for Winner interface compatibility
        });
        console.log(`🏆 [MOCK] WINNER FOUND! Game ${game.id} - Number: ${selectedNumber}`);
      }
    }

    console.log(`👑 [MOCK] Total winners found: ${winners.length}`);
    return winners;
  }  private async distributePrizes(winners: any[], totalPool: string, winningNumbers: number[]) {
    if (winners.length === 0) return;

    const prizePerWinner = BigInt(totalPool) / BigInt(winners.length);

    for (const winner of winners) {
      // Get current user stats
      const currentUser = await prisma.user.findUnique({
        where: { id: winner.userId }
      });

      if (!currentUser) continue;

      const newTotalWinnings = (BigInt(currentUser.totalWinnings || '0') + prizePerWinner).toString();

      // Update game session
      await prisma.gameSession.update({
        where: { id: winner.gameId },
        data: {
          winningNumbers: winningNumbers[0].toString(),
          isWinner: true,
          prizeAmount: prizePerWinner.toString(),
          confirmedAt: new Date()
        }
      });
      
      // Update user stats
      await prisma.user.update({
        where: { id: winner.userId },
        data: {
          totalWinnings: newTotalWinnings,
          totalGamesWon: currentUser.totalGamesWon + 1
        }
      });

      winner.prizeAmount = prizePerWinner.toString();
    }
  }
  private async markLosingGames(allGames: any[], winners: any[], winningNumbers: number[]) {
    const winnerGameIds = new Set(winners.map(w => w.gameId));
    const losingGames = allGames.filter(game => !winnerGameIds.has(game.id));

    for (const game of losingGames) {
      await prisma.gameSession.update({
        where: { id: game.id },
        data: {
          winningNumbers: winningNumbers[0].toString(), // Solo un número en el nuevo sistema
          isWinner: false,
          confirmedAt: new Date()
        }
      });
    }
  }

  private async updateUserTotals(userId: string, betAmount: string, contribution: string) {
    // Get current user to calculate new totals
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        totalAmountPlayed: true, 
        totalContributed: true,
        participations: true 
      }
    });

    if (currentUser) {      // Update existing user by adding to current totals
      const betAmountBigInt = BigInt(betAmount);
      const contributionBigInt = BigInt(Math.floor(parseFloat(contribution)));
      const currentTotalPlayedBigInt = BigInt(Math.floor(parseFloat(currentUser.totalAmountPlayed)));
      const currentTotalContributedBigInt = BigInt(Math.floor(parseFloat(currentUser.totalContributed)));
      const newTotalPlayed = (currentTotalPlayedBigInt + betAmountBigInt).toString();
      const newTotalContributed = (currentTotalContributedBigInt + contributionBigInt).toString();
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalAmountPlayed: newTotalPlayed,
          totalContributed: newTotalContributed,
          participations: currentUser.participations + 1
        }
      });
    } else {      // Create new user if doesn't exist (this should not happen if validation works)
      await prisma.user.create({
        data: {
          id: userId,
          totalAmountPlayed: betAmount,
          totalContributed: BigInt(Math.floor(parseFloat(contribution))).toString(),
          participations: 1,
          totalWinnings: '0',
          totalGamesWon: 0,
          longestStreak: 0
        }
      });
    }
  }
  private async updateONGTotals(ongId: string, contribution: string) {
    // Get current ONG to calculate new total
    const currentONG = await prisma.approvedONG.findUnique({
      where: { id: ongId },
      select: { 
        totalFundsReceived: true,
        totalGamesSupporting: true 
      }
    });    if (currentONG) {
      // Ensure both values are valid BigInt strings (no decimals)
      const contributionBigInt = BigInt(Math.floor(parseFloat(contribution)));
      const currentFundsBigInt = BigInt(Math.floor(parseFloat(currentONG.totalFundsReceived)));
      const newTotalFunds = (currentFundsBigInt + contributionBigInt).toString();
      
      await prisma.approvedONG.update({
        where: { id: ongId },
        data: {
          totalGamesSupporting: currentONG.totalGamesSupporting + 1,
          totalFundsReceived: newTotalFunds
        }
      });
    }
  }
}