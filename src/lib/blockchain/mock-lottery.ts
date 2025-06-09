// 🎭 FUNCIONALIDAD: Simula completamente el contrato de lotería
// Permite desarrollar sin smart contract real, manteniendo toda la lógica

import { prisma } from '../prisma';
import { defaultBlockchainConfig } from './config';
import { validateLotteryNumbers } from '../validations';
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
    console.log('🎰 [MOCK] Placing bet:', {
      userId,
      selectedNumbers,
      selectedOngId,
      betAmount: `${betAmount} wei`
    });

    try {
      // 🔍 VALIDACIONES
      await this.validateBet(userId, selectedNumbers, selectedOngId, betAmount);

      // 🎯 GENERAR DATOS MOCK
      const mockTxHash = this.generateMockTxHash();
      const mockBlockNumber = this.generateMockBlockNumber();
      
      // 💰 CALCULAR DISTRIBUCIÓN
      const distribution = this.calculateFundDistribution(betAmount);

      // 📝 CREAR SESIÓN DE JUEGO
      const gameSession = await prisma.gameSession.create({
        data: {
          userId,
          selectedOngId,
          selectedNumbers: selectedNumbers.join(','),
          amountPlayed: betAmount,
          contributionPercentage: this.config.ongPercentage,
          contributionAmount: distribution.ongShare,
          gameTransactionHash: mockTxHash,
          blockNumber: BigInt(mockBlockNumber),
          playedAt: new Date()
        }
      });

      // 🔄 ACTUALIZAR TOTALES
      await this.updateUserTotals(userId, betAmount, distribution.ongShare);
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
  async drawNumbers(): Promise<DrawResult> {
    console.log('🎲 [MOCK] Drawing numbers...');

    try {
      const pendingGames = await this.getPendingGames();
      
      if (pendingGames.length < this.config.minPlayersForDraw) {
        throw new Error(
          `Not enough players. Need ${this.config.minPlayersForDraw}, have ${pendingGames.length}`
        );
      }

      const winningNumbers = this.generateWinningNumbers();
      console.log('🎯 [MOCK] Winning numbers:', winningNumbers);

      const winners = await this.findWinners(pendingGames, winningNumbers);
      console.log('👑 [MOCK] Winners found:', winners.length);

      const totalPrizePool = await this.getCurrentPool();
      await this.distributePrizes(winners, totalPrizePool, winningNumbers);
      await this.markLosingGames(pendingGames, winners, winningNumbers);

      const drawId = `draw_${Date.now()}`;

      return {
        winningNumbers,
        winners: winners.map(w => ({
          userId: w.userId,
          gameId: w.gameId,
          prizeAmount: w.prizeAmount,
          matchedNumbers: w.matchedNumbers
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
    const result = await prisma.gameSession.aggregate({
      _sum: { amountPlayed: true },
      where: { winningNumbers: null }
    });

    const totalPlayed = BigInt(result._sum.amountPlayed || '0');
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

  async triggerDraw(): Promise<DrawResult> {
    return await this.drawNumbers();
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
    const numbers = new Set<number>();
    while (numbers.size < this.config.numbersCount) {
      numbers.add(Math.floor(Math.random() * this.config.numbersRange) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  private async getPendingGames() {
    return await prisma.gameSession.findMany({
      where: {
        winningNumbers: null,
        playedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
        }
      },
      include: {
        user: { select: { id: true, email: true } },
        selectedOng: { select: { id: true, name: true } }
      }
    });
  }

  private async findWinners(games: any[], winningNumbers: number[]) {
    const winners = [];

    for (const game of games) {
      const selectedNumbers = game.selectedNumbers.split(',').map(Number);
      const matches = selectedNumbers.filter(num => winningNumbers.includes(num));
      
      if (matches.length >= this.config.minMatchesToWin) {
        winners.push({
          userId: game.userId,
          gameId: game.id,
          matchedNumbers: matches.length,
          prizeAmount: '0' // Se calculará después
        });
      }
    }

    return winners;
  }

  private async distributePrizes(winners: any[], totalPool: string, winningNumbers: number[]) {
    if (winners.length === 0) return;

    const prizePerWinner = BigInt(totalPool) / BigInt(winners.length);

    for (const winner of winners) {
      await prisma.gameSession.update({
        where: { id: winner.gameId },
        data: {
          winningNumbers: winningNumbers.join(','),
          isWinner: true,
          prizeAmount: prizePerWinner.toString(),
          confirmedAt: new Date()
        }
      });

      await prisma.user.update({
        where: { id: winner.userId },
        data: {
          totalWinnings: { increment: prizePerWinner.toString() },
          totalGamesWon: { increment: 1 }
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
          winningNumbers: winningNumbers.join(','),
          isWinner: false,
          confirmedAt: new Date()
        }
      });
    }
  }

  private async updateUserTotals(userId: string, betAmount: string, contribution: string) {
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        totalAmountPlayed: { increment: betAmount },
        totalContributed: { increment: contribution },
        participations: { increment: 1 }
      },
      create: {
        id: userId,
        totalAmountPlayed: betAmount,
        totalContributed: contribution,
        participations: 1
      }
    });
  }

  private async updateONGTotals(ongId: string, contribution: string) {
    await prisma.approvedONG.update({
      where: { id: ongId },
      data: {
        totalGamesSupporting: { increment: 1 },
        totalFundsReceived: { increment: contribution }
      }
    });
  }
}