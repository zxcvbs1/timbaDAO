// Script para crear datos de ejemplo de sorteos
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function createSampleGameSessions() {
  console.log('🎲 [SEED] Creando sesiones de juego de ejemplo...\n');

  try {
    // 🎯 CREAR UNA ONG DE EJEMPLO PRIMERO
    const beneficiaryONG = await prisma.approvedONG.upsert({
      where: { id: 'ong-esperanza-verde' },
      update: {},
      create: {
        id: 'ong-esperanza-verde',
        name: 'Fundación Esperanza Verde',
        description: 'Dedicada a la conservación del medio ambiente y reforestación',
        mission: 'Crear un mundo más verde para las futuras generaciones',
        walletAddress: '0x742d35Cc6634C0532925a3b8D1892077e2ba6a83',
        website: 'https://esperanzaverde.org',
        category: 'ENVIRONMENT',
        totalGamesSupporting: 0,
        totalFundsReceived: '0'
      }
    });

    console.log(`✅ ONG creada: ${beneficiaryONG.name}`);

    // 🎯 CREAR USUARIOS DE EJEMPLO
    const sampleUsers = [
      {
        id: '0x1234567890abcdef1234567890abcdef12345671',
        email: 'user1@example.com',
        participations: 15
      },
      {
        id: '0x1234567890abcdef1234567890abcdef12345672', 
        email: 'user2@example.com',
        participations: 8
      },
      {
        id: '0x1234567890abcdef1234567890abcdef12345673',
        email: 'user3@example.com',
        participations: 12
      }
    ];

    for (const userData of sampleUsers) {
      await prisma.user.upsert({
        where: { id: userData.id },
        update: {},
        create: {
          id: userData.id,
          email: userData.email,
          participations: userData.participations,
          totalAmountPlayed: '0',
          totalWinnings: '0',
          totalContributed: '0'
        }
      });
      console.log(`✅ Usuario creado: ${userData.email}`);
    }

    // 🎲 CREAR SESIONES DE JUEGO DE EJEMPLO
    const sampleSessions = [
      {
        userId: sampleUsers[0].id,
        selectedNumbers: '7,13,22,31',
        winningNumbers: '7,13,22,31', // Ganador completo
        isWinner: true,
        amountPlayed: '1000000000000000000', // 1 ETH
        prizeAmount: '7800000000000000000', // 7.8 ETH
        playedAt: new Date('2025-06-08T20:00:00Z')
      },
      {
        userId: sampleUsers[1].id,
        selectedNumbers: '7,13,22,44',
        winningNumbers: '7,13,22,31', // 3 números correctos
        isWinner: true,
        amountPlayed: '1000000000000000000',
        prizeAmount: '3900000000000000000', // 3.9 ETH
        playedAt: new Date('2025-06-08T20:00:00Z')
      },
      {
        userId: sampleUsers[2].id,
        selectedNumbers: '3,8,14,27',
        winningNumbers: '3,8,14,27', // Ganador completo anterior
        isWinner: true,
        amountPlayed: '1000000000000000000',
        prizeAmount: '4450000000000000000', // 4.45 ETH
        playedAt: new Date('2025-06-07T20:00:00Z')
      },
      {
        userId: sampleUsers[0].id,
        selectedNumbers: '1,5,18,20',
        winningNumbers: '1,5,18,42', // 3 números correctos
        isWinner: true,
        amountPlayed: '1000000000000000000',
        prizeAmount: '5075000000000000000', // 5.075 ETH
        playedAt: new Date('2025-06-06T20:00:00Z')
      },
      {
        userId: sampleUsers[1].id,
        selectedNumbers: '9,15,28,39',
        winningNumbers: '1,5,18,42', // Sin coincidencias
        isWinner: false,
        amountPlayed: '1000000000000000000',
        prizeAmount: null,
        playedAt: new Date('2025-06-06T20:00:00Z')
      }
    ];

    for (let i = 0; i < sampleSessions.length; i++) {
      const sessionData = sampleSessions[i];
      
      const session = await prisma.gameSession.create({
        data: {
          userId: sessionData.userId,
          selectedOngId: beneficiaryONG.id,
          selectedNumbers: sessionData.selectedNumbers,
          winningNumbers: sessionData.winningNumbers,
          amountPlayed: sessionData.amountPlayed,
          contributionPercentage: 15.0,
          contributionAmount: (parseFloat(sessionData.amountPlayed) * 0.15).toString(),
          isWinner: sessionData.isWinner,
          prizeAmount: sessionData.prizeAmount,
          gameTransactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: BigInt(1000000 + i),
          playedAt: sessionData.playedAt,
          confirmedAt: sessionData.playedAt
        }
      });

      console.log(`✅ Sesión ${i + 1} creada:`, {
        id: session.id,
        winner: sessionData.isWinner ? '🏆' : '❌',
        numbers: `${sessionData.selectedNumbers} vs ${sessionData.winningNumbers}`,
        prize: sessionData.prizeAmount ? `${(parseFloat(sessionData.prizeAmount) / 1e18).toFixed(2)} ETH` : 'N/A'
      });
    }

    // 📊 ACTUALIZAR ESTADÍSTICAS DE LA ONG
    const totalSessions = sampleSessions.length;
    const totalContributions = sampleSessions.reduce((sum, session) => {
      return sum + (parseFloat(session.amountPlayed) * 0.15);
    }, 0);

    await prisma.approvedONG.update({
      where: { id: beneficiaryONG.id },
      data: {
        totalGamesSupporting: totalSessions,
        totalFundsReceived: (totalContributions / 1e18).toString()
      }
    });

    console.log('\n🎉 ¡Datos de sesiones de juego creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   • ${sampleSessions.length} sesiones de juego`);
    console.log(`   • ${sampleUsers.length} usuarios participantes`);
    console.log(`   • ${sampleSessions.filter(s => s.isWinner).length} sesiones ganadoras`);
    console.log(`   • ${(totalContributions / 1e18).toFixed(4)} ETH contribuidos a ONGs`);
    console.log(`   • 1 ONG beneficiaria configurada`);

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
createSampleGameSessions();
