/**
 * 🎯 Script rápido para crear datos de prueba específicos
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function createQuickTestData() {
  console.log('🎯 Creando datos de prueba rápidos...');

  try {
    // Conseguir primera ONG
    const ong = await prisma.approvedONG.findFirst();
    if (!ong) {
      console.log('❌ No hay ONGs');
      return;
    }

    const testUserId = 'testuser@example.com';

    // Crear o actualizar usuario
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: testUserId,
        participations: 1,
        totalAmountPlayed: '1000000000000000000',
        totalWinnings: '0',
        totalContributed: '250000000000000000',
        totalGamesWon: 0,
        longestStreak: 0
      }
    });

    console.log(`✅ Usuario creado: ${testUserId}`);

    // Crear sesión ganadora
    await prisma.gameSession.create({
      data: {
        id: 'test-winner-1',
        userId: testUserId,
        selectedOngId: ong.id,
        selectedNumbers: '2,4,6,8', // Usuario eligió estos números
        winningNumbers: '2,4,6,8',  // ¡Coinciden exactamente!
        amountPlayed: '1000000000000000000',
        contributionPercentage: 25,
        contributionAmount: '250000000000000000',
        gameTransactionHash: '0xtest123',
        blockNumber: BigInt(2000001),
        playedAt: new Date('2025-06-10T12:00:00'),
        confirmedAt: new Date('2025-06-10T12:05:00'),
        isWinner: true,
        prizeAmount: '5000000000000000000'
      }
    });

    // Crear sesión perdedora
    await prisma.gameSession.create({
      data: {
        id: 'test-loser-1',
        userId: testUserId,
        selectedOngId: ong.id,
        selectedNumbers: '1,3,5,7', // Usuario eligió estos números
        winningNumbers: '2,4,6,8',  // Solo acertó 0 números
        amountPlayed: '500000000000000000',
        contributionPercentage: 25,
        contributionAmount: '125000000000000000',
        gameTransactionHash: '0xtest456',
        blockNumber: BigInt(2000002),
        playedAt: new Date('2025-06-09T15:00:00'),
        confirmedAt: new Date('2025-06-09T15:05:00'),
        isWinner: false,
        prizeAmount: '0'
      }
    });

    console.log('🎉 Datos de prueba creados:');
    console.log(`   - Usuario: ${testUserId}`);
    console.log('   - 1 sesión ganadora (4/4 números)');
    console.log('   - 1 sesión perdedora (0/4 números)');
    console.log('\n🌐 Recarga la página para ver los resultados con feedback personalizado!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createQuickTestData();
