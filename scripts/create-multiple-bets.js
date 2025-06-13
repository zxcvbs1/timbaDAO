#!/usr/bin/env node
// Script para crear múltiples apuestas para testing

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function createMultipleBets() {
  try {
    console.log('🎰 Creating multiple test bets...\n');
    
    // First, get or create test users
    const testUsers = [
      { id: '0x1111111111111111111111111111111111111111', email: 'test1@example.com' },
      { id: '0x2222222222222222222222222222222222222222', email: 'test2@example.com' },
      { id: '0x3333333333333333333333333333333333333333', email: 'test3@example.com' }
    ];
    
    // Get an active ONG
    const ong = await prisma.approvedONG.findFirst({ where: { isActive: true } });
    if (!ong) {
      console.log('❌ No active ONG found. Creating one...');
      const newOng = await prisma.approvedONG.create({
        data: {
          id: 'test-ong',
          name: 'Test ONG',
          description: 'Test ONG for development',
          mission: 'Testing',
          walletAddress: '0x0000000000000000000000000000000000000000',
          category: 'OTHER',
          isActive: true,
          totalGamesSupporting: 0,
          totalFundsReceived: '0'
        }
      });
      console.log('✅ Created test ONG:', newOng.name);
    }
    
    const selectedOng = ong || await prisma.approvedONG.findFirst({ where: { isActive: true } });
    
    // Create users if they don't exist
    for (const userData of testUsers) {
      await prisma.user.upsert({
        where: { id: userData.id },
        update: {},
        create: {
          id: userData.id,
          email: userData.email,
          totalAmountPlayed: '0',
          totalWinnings: '0',
          totalContributed: '0',
          participations: 0,
          totalGamesWon: 0,
          longestStreak: 0
        }
      });
    }
    
    // Create test bets with different numbers
    const testNumbers = [42, 77, 13]; // Different numbers for each user
    
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const selectedNumber = testNumbers[i];
      
      const gameSession = await prisma.gameSession.create({
        data: {
          userId: user.id,
          selectedOngId: selectedOng.id,
          selectedNumbers: selectedNumber.toString(),
          amountPlayed: '1000000000000000000', // 1 MNT
          contributionPercentage: 15,
          contributionAmount: '150000000000000000', // 15% of 1 MNT
          gameTransactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: BigInt(1000000 + i),
          playedAt: new Date()
        }
      });
      
      console.log(`✅ Created bet ${i + 1}: User ${user.id.slice(0, 8)}... selected number ${selectedNumber}`);
    }
    
    // Check total pending games
    const pendingCount = await prisma.gameSession.count({
      where: { winningNumbers: null }
    });
    
    console.log(`\n📊 Total pending games now: ${pendingCount}`);
    console.log(`⚙️ Required for draw: ${process.env.NODE_ENV === 'development' ? 3 : 10}`);
    
    if (pendingCount >= 3) {
      console.log('✅ You now have enough players to execute a draw!');
    } else {
      console.log('❌ Still need more players for a draw');
    }
    
  } catch (error) {
    console.error('❌ Error creating test bets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMultipleBets();
