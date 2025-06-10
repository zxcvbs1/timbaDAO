/**
 * 🎯 Script simple para crear escenarios de prueba
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function createSimpleScenarios() {
  console.log('🎯 Iniciando script...');

  try {
    console.log('📊 Conectando a base de datos...');
    
    // 🔍 OBTENER PRIMERA ONG DISPONIBLE
    const ong = await prisma.approvedONG.findFirst();
    console.log('ONGs encontradas:', ong ? 1 : 0);
    
    if (!ong) {
      console.log('❌ No hay ONGs disponibles');
      return;
    }

    console.log(`📍 Usando ONG: ${ong.name}`);

    // 🧹 LIMPIAR SOLO SESIONES DE JUEGO
    const deleted1 = await prisma.gameSession.deleteMany({});
    console.log(`🗑️ Eliminadas ${deleted1.count} sesiones`);

    // 👤 CREAR USUARIOS ÚNICOS
    const timestamp = Date.now();
    const testUserId = `testuser_${timestamp}`;
    const otherUserId = `otheruser_${timestamp}`;
    
    console.log(`👤 Creando usuario: ${testUserId}`);
    
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: `${testUserId}@example.com`,
        participations: 0,
        totalAmountPlayed: '0',
        totalWinnings: '0',
        totalContributed: '0',
        totalGamesWon: 0,
        longestStreak: 0
      }
    });
    console.log(`✅ Usuario creado: ${user.id}`);

    const otherUser = await prisma.user.create({
      data: {
        id: otherUserId,
        email: `${otherUserId}@example.com`,
        participations: 0,
        totalAmountPlayed: '0',
        totalWinnings: '0',
        totalContributed: '0',
        totalGamesWon: 0,
        longestStreak: 0
      }
    });
    console.log(`✅ Segundo usuario creado: ${otherUser.id}`);

    // 🏆 ESCENARIO 1: USUARIO GANÓ
    console.log('🏆 Creando: USUARIO GANÓ');
    await prisma.gameSession.create({
      data: {
        id: `win-scenario-${timestamp}`,
        userId: user.id,
        selectedOngId: ong.id,
        selectedNumbers: '7,3,9,1',
        winningNumbers: '7,3,9,1',
        amountPlayed: '1000000000000000000',
        contributionPercentage: 15,
        contributionAmount: '150000000000000000',
        gameTransactionHash: `0xwinner${timestamp}`,
        blockNumber: BigInt(1000001),
        playedAt: new Date('2025-06-09T20:00:00'),
        confirmedAt: new Date('2025-06-09T20:05:00'),
        isWinner: true,
        prizeAmount: '5000000000000000000'
      }
    });

    // 😔 ESCENARIO 2: USUARIO PERDIÓ (2 aciertos)
    console.log('😔 Creando: USUARIO PERDIÓ (2 aciertos)');
    await prisma.gameSession.create({
      data: {
        id: `lose-scenario-1-${timestamp}`,
        userId: user.id,
        selectedOngId: ong.id,
        selectedNumbers: '2,5,8,4',
        winningNumbers: '2,5,1,3',
        amountPlayed: '500000000000000000',
        contributionPercentage: 15,
        contributionAmount: '75000000000000000',
        gameTransactionHash: `0xloser1${timestamp}`,
        blockNumber: BigInt(1000002),
        playedAt: new Date('2025-06-08T19:00:00'),
        confirmedAt: new Date('2025-06-08T19:05:00'),
        isWinner: false,
        prizeAmount: '0'
      }
    });

    // 💔 ESCENARIO 3: USUARIO PERDIÓ (0 aciertos)
    console.log('💔 Creando: USUARIO PERDIÓ (0 aciertos)');
    await prisma.gameSession.create({
      data: {
        id: `lose-scenario-2-${timestamp}`,
        userId: user.id,
        selectedOngId: ong.id,
        selectedNumbers: '1,6,3,9',
        winningNumbers: '7,4,2,8',
        amountPlayed: '200000000000000000',
        contributionPercentage: 15,
        contributionAmount: '30000000000000000',
        gameTransactionHash: `0xloser2${timestamp}`,
        blockNumber: BigInt(1000003),
        playedAt: new Date('2025-06-07T18:00:00'),
        confirmedAt: new Date('2025-06-07T18:05:00'),
        isWinner: false,
        prizeAmount: '0'
      }
    });

    // 👥 ESCENARIO 4: SORTEO DE OTRO USUARIO
    console.log('👥 Creando: SORTEO DE OTRO USUARIO');
    await prisma.gameSession.create({
      data: {
        id: `other-user-win-${timestamp}`,
        userId: otherUser.id,
        selectedOngId: ong.id,
        selectedNumbers: '5,8,2,6',
        winningNumbers: '5,8,2,6',
        amountPlayed: '3000000000000000000',
        contributionPercentage: 15,
        contributionAmount: '450000000000000000',
        gameTransactionHash: `0xother${timestamp}`,
        blockNumber: BigInt(1000004),
        playedAt: new Date('2025-06-06T17:00:00'),
        confirmedAt: new Date('2025-06-06T17:05:00'),
        isWinner: true,
        prizeAmount: '10000000000000000000'
      }
    });

    console.log('\n🎉 ¡Escenarios creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   • Usuario principal: ${user.id}`);
    console.log('   • 1 victoria (4 números exactos)');
    console.log('   • 1 derrota con 2 aciertos');
    console.log('   • 1 derrota con 0 aciertos');
    console.log('   • 1 sorteo de otro usuario');
    console.log('\n🌐 Para probar en la app, usa userAddress =', user.id);
    console.log('🔗 O copia este ID:', user.id);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleScenarios();
