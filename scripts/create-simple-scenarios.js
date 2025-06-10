/**
 * 🎯 Script simple para crear escenarios de prueba
 * Crea datos de prueba para mostrar los números jugados por el usuario
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function createSimpleScenarios() {
  console.log('🎯 [SEED] Creando escenarios simples...\n');

  try {    // 🔍 OBTENER PRIMERA ONG DISPONIBLE
    const ong = await prisma.approvedONG.findFirst();
    if (!ong) {
      console.log('❌ No hay ONGs disponibles. Creando ONG de prueba...');
      // Crear una ONG simple
      await prisma.approvedONG.create({
        data: {
          id: 'ong-test',
          name: 'ONG de Prueba',
          description: 'ONG para testing',
          mission: 'Testing de la aplicación',
          isActive: true,
          isApproved: true,
          totalFundsReceived: '0',
          totalGamesSupporting: 0,
          category: 'education'
        }
      });
      console.log('✅ ONG de prueba creada');
    }

    const ongToUse = ong || await prisma.approvedONG.findFirst();
    console.log(`📍 Usando ONG: ${ongToUse.name} (ID: ${ongToUse.id})`);

    // 🧹 LIMPIAR DATOS ANTERIORES
    await prisma.gameSession.deleteMany({});
    console.log('✅ Datos anteriores limpiados');    // 👤 USUARIO DE PRUEBA (tu dirección)
    const testUserId = 'user1@example.com';

    // 🔧 CREAR O ACTUALIZAR USUARIO
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: testUserId,
        participations: 0,
        totalAmountPlayed: '0',
        totalWinnings: '0',
        totalContributed: '0',
        totalGamesWon: 0,
        longestStreak: 0
      }
    });
    console.log(`✅ Usuario creado/actualizado: ${testUserId}`);

    // 🔧 CREAR USUARIO ADICIONAL PARA OTROS SORTEOS
    await prisma.user.upsert({
      where: { id: 'otheruser@example.com' },
      update: {},
      create: {
        id: 'otheruser@example.com',
        email: 'otheruser@example.com',
        participations: 0,
        totalAmountPlayed: '0',
        totalWinnings: '0',
        totalContributed: '0',
        totalGamesWon: 0,
        longestStreak: 0
      }
    });
    console.log('✅ Usuario adicional creado');

    // 🎲 ESCENARIO 1: USUARIO GANÓ
    console.log('🏆 Creando escenario: USUARIO GANÓ');
    await prisma.gameSession.create({
      data: {
        id: 'win-scenario-1',
        userId: testUserId,
        selectedOngId: ongToUse.id,
        selectedNumbers: '7,3,9,1', // Números que eligió el usuario
        winningNumbers: '7,3,9,1',   // Números ganadores (¡coinciden!)
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

    // 🎯 ESCENARIO 2: USUARIO PERDIÓ (pero acertó algunos números)
    console.log('😔 Creando escenario: USUARIO PERDIÓ (2 aciertos)');
    await prisma.gameSession.create({
      data: {
        id: 'lose-scenario-1',
        userId: testUserId,
        selectedOngId: ongToUse.id,
        selectedNumbers: '2,5,8,4', // Números que eligió el usuario
        winningNumbers: '2,5,1,3',   // Solo acertó 2 números (2,5)
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

    // 🎯 ESCENARIO 3: USUARIO PERDIÓ COMPLETAMENTE
    console.log('💔 Creando escenario: USUARIO PERDIÓ (0 aciertos)');
    await prisma.gameSession.create({
      data: {
        id: 'lose-scenario-2',
        userId: testUserId,
        selectedOngId: ongToUse.id,
        selectedNumbers: '1,6,3,9', // Números que eligió el usuario
        winningNumbers: '7,4,2,8',   // Ningún número coincide
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

    // 🎊 ESCENARIO 4: SORTEO SIN PARTICIPACIÓN DEL USUARIO
    console.log('👥 Creando escenario: SORTEO DE OTROS USUARIOS');
    await prisma.gameSession.create({
      data: {
        id: 'other-user-win',
        userId: 'otheruser@example.com',
        selectedOngId: ongToUse.id,
        selectedNumbers: '5,8,2,6',
        winningNumbers: '5,8,2,6',
        amountPlayed: '3000000000000000000', // 3 ETH
        contributionPercentage: 15,
        contributionAmount: '450000000000000000',
        gameTransactionHash: '0xother123',
        blockNumber: BigInt(1000004),
        playedAt: new Date('2025-06-06T17:00:00'),
        confirmedAt: new Date('2025-06-06T17:05:00'),
        isWinner: true,
        prizeAmount: '10000000000000000000' // 10 ETH de premio
      }
    });

    console.log('\n🎉 ¡Escenarios simples creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   • Usuario: ${testUserId}`);
    console.log('   • 1 victoria (4 números exactos)');
    console.log('   • 1 derrota con 2 aciertos');
    console.log('   • 1 derrota con 0 aciertos');
    console.log('   • 1 sorteo de otro usuario');
    console.log('\n🌐 Visita la app para ver los resultados con feedback personalizado');

  } catch (error) {
    console.error('❌ Error creando escenarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
createSimpleScenarios();
