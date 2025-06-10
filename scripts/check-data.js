/**
 * 🔍 Script para ver qué datos hay en la base de datos
 */

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Revisando datos en la base de datos...\n');

  try {
    // Ver usuarios
    const users = await prisma.user.findMany({
      select: { id: true, email: true, participations: true }
    });
    console.log('👥 USUARIOS:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id} | Email: ${user.email} | Participaciones: ${user.participations}`);
    });

    // Ver sesiones de juego completadas
    const completedSessions = await prisma.gameSession.findMany({
      where: {
        winningNumbers: { not: null }
      },
      include: {
        user: { select: { id: true, email: true } },
        selectedOng: { select: { name: true } }
      },
      orderBy: [
        { confirmedAt: 'desc' },
        { playedAt: 'desc' }
      ]
    });

    console.log('\n🎲 SESIONES COMPLETADAS:');
    if (completedSessions.length === 0) {
      console.log('  ❌ No hay sesiones completadas');
    } else {
      completedSessions.forEach((session, index) => {
        console.log(`  ${index + 1}. Usuario: ${session.user.id}`);
        console.log(`     Números jugados: ${session.selectedNumbers}`);
        console.log(`     Números ganadores: ${session.winningNumbers}`);
        console.log(`     ¿Ganó?: ${session.isWinner}`);
        console.log(`     Premio: ${session.prizeAmount || '0'}`);
        console.log(`     ONG: ${session.selectedOng?.name}`);
        console.log(`     Fecha: ${session.confirmedAt || session.playedAt}`);
        console.log('');
      });
    }

    // Ver sesiones pendientes
    const pendingSessions = await prisma.gameSession.findMany({
      where: {
        winningNumbers: null
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    console.log('⏳ SESIONES PENDIENTES:');
    if (pendingSessions.length === 0) {
      console.log('  ✅ No hay sesiones pendientes');
    } else {
      pendingSessions.forEach((session, index) => {
        console.log(`  ${index + 1}. Usuario: ${session.user.id}`);
        console.log(`     Números jugados: ${session.selectedNumbers}`);
        console.log(`     Fecha: ${session.playedAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
