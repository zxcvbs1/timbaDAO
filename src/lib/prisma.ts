// 🗄️ FUNCIONALIDAD: Cliente de Prisma para conexión a base de datos
// Maneja la conexión singleton con Neon PostgreSQL

import { PrismaClient } from '../generated/prisma';

// 🔧 SINGLETON PATTERN para cliente Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 🔄 FUNCIONES DE UTILIDAD PARA TESTING
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    return false;
  }
}

// 🧹 FUNCIONES DE CLEANUP PARA TESTING
export async function cleanupTestData() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Cleanup functions can only be used in test environment');
  }

  try {
    // Orden importante para evitar violaciones de foreign key
    await prisma.vote.deleteMany();
    await prisma.oNGProposal.deleteMany();
    await prisma.gameSession.deleteMany();
    await prisma.approvedONG.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Test data cleaned up successfully');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
    throw error;
  }
}

export default prisma;