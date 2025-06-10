console.log('🎯 Iniciando script simple...');

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('📊 Probando conexión...');
    const count = await prisma.approvedONG.count();
    console.log('ONGs encontradas:', count);
    
    if (count > 0) {
      console.log('✅ Base de datos funcionando');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔚 Desconectado');
  }
}

test();
