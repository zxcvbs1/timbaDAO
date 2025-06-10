/**
 * 🎯 Script para crear datos específicos para el usuario actual
 * Crea sesiones con un userId específico para mostrar feedback personalizado
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function createUserSpecificData() {
  console.log('🎯 Creando datos específicos para usuario...\n');

  try {
    // 🔍 OBTENER PRIMERA ONG DISPONIBLE
    const ong = await prisma.approvedONG.findFirst();
    if (!ong) {
      console.log('❌ No hay ONGs disponibles');
      return;
    }

    console.log(`📍 Usando ONG: ${ong.name}`);

    // 🧹 LIMPIAR SESIONES ANTERIORES
    await prisma.gameSession.deleteMany({});
    console.log('✅ Sesiones anteriores eliminadas');

    // 👤 USUARIO DE PRUEBA - USA UNA DIRECCIÓN FIJA
    const testUserId = 'test-user-123'; // ID fijo para testing
    
    // 🔧 CREAR USUARIO SI NO EXISTE
    let user = await prisma.user.findFirst({ where: { id: testUserId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: testUserId,
          email: 'test@example.com',
          participations: 0,
          totalAmountPlayed: '0',
          totalWinnings: '0',
          totalContributed: '0',
          totalGamesWon: 0,
          longestStreak: 0
        }
      });
      console.log(`✅ Usuario creado: ${testUserId}`);
    } else {
      console.log(`✅ Usuario encontrado: ${testUserId}`);
    }

    // 🏆 ESCENARIO 1: USUARIO GANÓ (todos los números exactos)
    console.log('🏆 Creando: USUARIO GANÓ');
    await prisma.gameSession.create({
      data: {
        id: 'win-scenario',
        userId: testUserId,
        selectedOngId: ong.id,
        selectedNumbers: '1,2,3,4',     // Números que eligió el usuario
        winningNumbers: '1,2,3,4',      // ¡Mismos números!
        amountPlayed: '1000000000000000000', // 1 ETH
        contributionPercentage: 15,
        contributionAmount: '150000000000000000',
        gameTransactionHash: '0xwinner123',
        blockNumber: BigInt(1000001),
        playedAt: new Date('2025-06-09T20:00:00'),
        confirmedAt: new Date('2025-06-09T20:05:00'),
        isWinner: true,
        prizeAmount: '5000000000000000000' // 5 ETH de premio
      }
    });

    // 😔 ESCENARIO 2: USUARIO PERDIÓ (acertó 2 números)
    console.log('😔 Creando: USUARIO PERDIÓ (2 aciertos)');
    await prisma.gameSession.create({
      data: {
        id: 'lose-scenario-1',
        userId: testUserId,
        selectedOngId: ong.id,
        selectedNumbers: '5,6,7,8',     // Números que eligió
        winningNumbers: '5,6,1,2',      // Solo acertó 5,6
        amountPlayed: '500000000000000000', // 0.5 ETH
        contributionPercentage: 15,
        contributionAmount: '75000000000000000',
        gameTransactionHash: '0xloser123',
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
        id: 'lose-scenario-2',
        userId: testUserId,
        selectedOngId: ong.id,
        selectedNumbers: '9,8,7,6',     // Números que eligió
        winningNumbers: '1,2,3,4',      // Ninguno coincide
        amountPlayed: '200000000000000000', // 0.2 ETH
        contributionPercentage: 15,
        contributionAmount: '30000000000000000',
        gameTransactionHash: '0xloser456',
        blockNumber: BigInt(1000003),
        playedAt: new Date('2025-06-07T18:00:00'),
        confirmedAt: new Date('2025-06-07T18:05:00'),
        isWinner: false,
        prizeAmount: '0'
      }
    });

    // 👥 ESCENARIO 4: OTRO USUARIO GANÓ (para mostrar sorteos sin participación)
    let otherUser = await prisma.user.findFirst({ where: { id: 'other-user' } });
    if (!otherUser) {
      otherUser = await prisma.user.create({
        data: {
          id: 'other-user',
          email: 'other@example.com',
          participations: 0,
          totalAmountPlayed: '0',
          totalWinnings: '0',
          totalContributed: '0',
          totalGamesWon: 0,
          longestStreak: 0
        }
      });
    }

    await prisma.gameSession.create({
      data: {
        id: 'other-user-win',
        userId: 'other-user',
        selectedOngId: ong.id,
        selectedNumbers: '0,1,2,3',
        winningNumbers: '0,1,2,3',
        amountPlayed: '3000000000000000000', // 3 ETH
        contributionPercentage: 15,
        contributionAmount: '450000000000000000',
        gameTransactionHash: '0xother123',
        blockNumber: BigInt(1000004),
        playedAt: new Date('2025-06-06T17:00:00'),
        confirmedAt: new Date('2025-06-06T17:05:00'),
        isWinner: true,
        prizeAmount: '10000000000000000000' // 10 ETH
      }
    });

    console.log('\n🎉 ¡Datos específicos creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   • Usuario de prueba: ${testUserId}`);
    console.log('   • 1 victoria (4 números exactos)');
    console.log('   • 1 derrota con 2 aciertos');
    console.log('   • 1 derrota con 0 aciertos');
    console.log('   • 1 sorteo de otro usuario');
    console.log('\n🔥 IMPORTANTE: Para ver el feedback personalizado:');
    console.log(`   • El componente debe recibir userAddress="${testUserId}"`);
    console.log('   • O modifica GameContent.tsx para usar este ID de prueba');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserSpecificData();
