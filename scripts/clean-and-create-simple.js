#!/usr/bin/env node
const { PrismaClient } = require('./src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function cleanAndCreateSimpleData() {
  console.log('🧹 Limpiando base de datos...');
  
  try {
    // 1. Eliminar todas las sesiones de juego
    const deleted = await prisma.gameSession.deleteMany({});
    console.log('✅ Eliminadas', deleted.count, 'sesiones de juego');
    
    // 2. Crear solo 3 sesiones simples con IDs únicos y fechas claras
    console.log('🎯 Creando datos limpios...');
    
    const now = new Date();
    const sessions = [];
    
    // Sesión más reciente (ganadora)
    const session1 = await prisma.gameSession.create({
      data: {
        userId: 'user1',
        selectedOngId: 'fundacion-esperanza-verde',
        selectedNumbers: '1,2,3,4',
        winningNumbers: '1,2,3,4',
        amountPlayed: '1000000000000000000', // 1 ETH
        contributionPercentage: 15,
        contributionAmount: '150000000000000000',
        gameTransactionHash: '0xabc123',
        blockNumber: BigInt(1000001),
        isWinner: true,
        prizeAmount: '5000000000000000000', // 5 ETH jackpot
        playedAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 min ago
        confirmedAt: new Date(now.getTime() - 5 * 60 * 1000)  // 5 min ago
      }
    });
    console.log('✅ Sesión 1 (más reciente): Jackpot ganador');
    
    // Sesión intermedia (perdedora)
    const session2 = await prisma.gameSession.create({
      data: {
        userId: 'user2',
        selectedOngId: 'fundacion-esperanza-verde',
        selectedNumbers: '5,6,7,8',
        winningNumbers: '1,2,3,9',
        amountPlayed: '1000000000000000000',
        contributionPercentage: 15,
        contributionAmount: '150000000000000000',
        gameTransactionHash: '0xdef456',
        blockNumber: BigInt(1000002),
        isWinner: false,
        prizeAmount: null,
        playedAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hora ago
        confirmedAt: new Date(now.getTime() - 55 * 60 * 1000) // 55 min ago
      }
    });
    console.log('✅ Sesión 2 (intermedia): Sin ganador');
    
    // Sesión más antigua (ganador parcial)
    const session3 = await prisma.gameSession.create({
      data: {
        userId: 'user3',
        selectedOngId: 'fundacion-esperanza-verde',
        selectedNumbers: '2,4,6,8',
        winningNumbers: '2,4,6,1',
        amountPlayed: '1000000000000000000',
        contributionPercentage: 15,
        contributionAmount: '150000000000000000',
        gameTransactionHash: '0xghi789',
        blockNumber: BigInt(1000003),
        isWinner: true,
        prizeAmount: '2000000000000000000', // 2 ETH por 3 coincidencias
        playedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 horas ago
        confirmedAt: new Date(now.getTime() - 115 * 60 * 1000)   // 115 min ago
      }
    });
    console.log('✅ Sesión 3 (más antigua): Ganador parcial');
    
    console.log('🎉 Datos limpios creados exitosamente!');
    console.log('📊 Orden esperado (más reciente primero):');
    console.log('   1. Sesión 1 - Jackpot 4 coincidencias (5 min ago)');
    console.log('   2. Sesión 2 - Sin ganador (55 min ago)');  
    console.log('   3. Sesión 3 - 3 coincidencias (115 min ago)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndCreateSimpleData();
