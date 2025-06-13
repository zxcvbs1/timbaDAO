#!/usr/bin/env node
// Script para verificar juegos pendientes

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function checkPendingGames() {
  try {
    console.log('🔍 Checking pending games...\n');
    
    const pendingGames = await prisma.gameSession.findMany({
      where: { winningNumbers: null },
      select: { 
        id: true, 
        userId: true, 
        selectedNumbers: true, 
        playedAt: true 
      },
      orderBy: { playedAt: 'desc' }
    });
    
    console.log(`📊 Total pending games: ${pendingGames.length}`);
    
    if (pendingGames.length > 0) {
      console.log('\n🎫 Pending games details:');
      pendingGames.forEach((game, index) => {
        console.log(`${index + 1}. ID: ${game.id}`);
        console.log(`   User: ${game.userId}`);
        console.log(`   Number: ${game.selectedNumbers}`);
        console.log(`   Played: ${game.playedAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No pending games found');
    }
    
    // Check config
    console.log('⚙️ Configuration:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   Required players: ${process.env.NODE_ENV === 'development' ? 3 : 10}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingGames();
