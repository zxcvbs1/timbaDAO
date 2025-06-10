#!/usr/bin/env node
/**
 * 🎯 Script para crear escenarios de lotería con ganadores
 * Genera sesiones de juego que resultan en premios
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function createWinningScenarios() {
  console.log('🎯 [SEED] Creando escenarios con ganadores...\n');

  try {
    // 🔍 OBTENER PRIMERA ONG DISPONIBLE
    const ong = await prisma.ong.findFirst();
    if (!ong) {
      throw new Error('No hay ONGs disponibles. Ejecuta el script de seed primero.');
    }
    
    console.log(`📍 Usando ONG: ${ong.name} (ID: ${ong.id})`);

    // 🎲 ESCENARIO 1: Jackpot completo (4 números exactos)
    console.log('🏆 Escenario 1: JACKPOT COMPLETO');
    const winningNumbers1 = [7, 3, 9, 1];
    
    // Crear algunas apuestas perdedoras
    await createGameSession('user1@example.com', [2, 5, 8, 4], ong.id);
    await createGameSession('user2@example.com', [1, 6, 3, 9], ong.id);
    
    // Crear apuesta ganadora (números exactos)
    const jackpotSession = await createGameSession('user3@example.com', winningNumbers1, ong.id);
    
    // Simular sorteo con estos números
    await executeDrawForSessions([jackpotSession.id], winningNumbers1);
    
    console.log(`✅ Jackpot creado: ${winningNumbers1.join(',')} - Ganador: user3@example.com\n`);

    // 🎯 ESCENARIO 2: Múltiples ganadores con 3 aciertos
    console.log('🎯 Escenario 2: MÚLTIPLES GANADORES (3 aciertos)');
    const winningNumbers2 = [5, 8, 2, 6];
    
    // Crear varias apuestas con 3 números coincidentes
    const session1 = await createGameSession('user1@example.com', [5, 8, 2, 9], ong.id); // 3 aciertos
    const session2 = await createGameSession('user2@example.com', [5, 8, 1, 6], ong.id); // 3 aciertos
    const session3 = await createGameSession('user3@example.com', [4, 8, 2, 6], ong.id); // 3 aciertos
    
    // Algunas perdedoras
    await createGameSession('user1@example.com', [1, 3, 4, 7], ong.id); // 0 aciertos
    
    await executeDrawForSessions([session1.id, session2.id, session3.id], winningNumbers2);
    
    console.log(`✅ Múltiples ganadores: ${winningNumbers2.join(',')} - 3 ganadores con 3 aciertos\n`);

    // 🎊 ESCENARIO 3: Gran sorteo con diferentes niveles de premio
    console.log('🎊 Escenario 3: GRAN SORTEO MIXTO');
    const winningNumbers3 = [9, 4, 7, 2];
      // 1 ganador con 4 aciertos (jackpot)
    const jackpotSession2 = await createGameSession('user2@example.com', [9, 4, 7, 2], ong.id);
    
    // 2 ganadores con 3 aciertos
    const session3a = await createGameSession('user1@example.com', [9, 4, 7, 5], ong.id);
    const session3b = await createGameSession('user3@example.com', [9, 4, 1, 2], ong.id);
    
    // Varias perdedoras para aumentar el pozo
    await createGameSession('user1@example.com', [1, 5, 6, 8], ong.id);
    await createGameSession('user2@example.com', [3, 5, 8, 1], ong.id);
    await createGameSession('user3@example.com', [1, 3, 5, 6], ong.id);
    
    await executeDrawForSessions([jackpotSession2.id, session3a.id, session3b.id], winningNumbers3);
    
    console.log(`✅ Gran sorteo: ${winningNumbers3.join(',')} - 1 jackpot + 2 ganadores secundarios\n`);

    console.log('🎉 ¡Escenarios de ganadores creados exitosamente!');
    console.log('📊 Resumen:');
    console.log('   • 3 sorteos completados');
    console.log('   • Múltiples ganadores con diferentes niveles de premio');
    console.log('   • Datos realistas para testing de la UI');
    console.log('\n🌐 Visita http://localhost:3000/results para ver los resultados');

  } catch (error) {
    console.error('❌ Error creando escenarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createGameSession(userEmail, selectedNumbers, ongId) {
  // Buscar o crear usuario
  let user = await prisma.user.findFirst({
    where: { email: userEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userEmail.replace('@example.com', ''),
        email: userEmail,
        participations: 0,
        totalAmountPlayed: '0',
        totalWinnings: '0',
        totalContributed: '0',
        totalGamesWon: 0,
        longestStreak: 0
      }
    });
  }

  // Crear sesión de juego
  const gameSession = await prisma.gameSession.create({
    data: {
      userId: user.id,
      selectedOngId: ongId,
      selectedNumbers: selectedNumbers.join(','),
      amountPlayed: '1000000000000000000', // 1 MNT
      contributionPercentage: 15,
      contributionAmount: '150000000000000000', // 15%
      gameTransactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: BigInt(Math.floor(Math.random() * 1000000) + 1000000),
      playedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Últimas 24h
    }
  });

  return gameSession;
}

async function executeDrawForSessions(sessionIds, winningNumbers) {
  // Actualizar todas las sesiones con números ganadores
  const allSessions = await prisma.gameSession.findMany({
    where: {
      winningNumbers: null,
      playedAt: {
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // Últimas 48h para incluir las nuevas
      }
    }
  });

  for (const session of allSessions) {
    const selectedNumbers = session.selectedNumbers.split(',').map(Number);
    const matches = selectedNumbers.filter(num => winningNumbers.includes(num)).length;
    
    let isWinner = matches >= 3; // Mínimo 3 aciertos para ganar
    let prizeAmount = '0';
    
    if (isWinner) {
      // Calcular premio basado en coincidencias
      const basePrize = 1000000000000000000; // 1 MNT base
      switch (matches) {
        case 4: prizeAmount = (basePrize * 5).toString(); break; // 5 MNT por jackpot
        case 3: prizeAmount = (basePrize * 2).toString(); break; // 2 MNT por 3 aciertos
        default: prizeAmount = basePrize.toString(); break;
      }
    }

    await prisma.gameSession.update({
      where: { id: session.id },
      data: {
        winningNumbers: winningNumbers.join(','),
        isWinner,
        prizeAmount,
        confirmedAt: new Date()
      }
    });
  }
}

// Ejecutar el script
createWinningScenarios().catch(console.error);
