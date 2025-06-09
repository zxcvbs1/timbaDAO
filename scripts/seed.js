"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database with initial ONGs...');
    // Create initial approved ONGs
    const initialONGs = [
        {
            id: 'children-hope',
            name: 'Esperanza Infantil',
            description: 'Dedicados a brindar educación y alimentación a niños en situación vulnerable',
            mission: 'Construir un futuro mejor para los niños más necesitados',
            icon: '👶',
            website: 'https://esperanzainfantil.org',
            isActive: true,
            category: 'CHILDREN'
        },
        {
            id: 'green-planet',
            name: 'Planeta Verde',
            description: 'Organización enfocada en la conservación del medio ambiente y reforestación',
            mission: 'Proteger y restaurar nuestro planeta para las futuras generaciones',
            icon: '🌱',
            website: 'https://planetaverde.org',
            isActive: true,
            category: 'ENVIRONMENT'
        },
        {
            id: 'tech-education',
            name: 'TechEducación',
            description: 'Enseñamos programación y tecnología a jóvenes en comunidades de bajos recursos',
            mission: 'Democratizar el acceso a la educación tecnológica',
            icon: '💻',
            website: 'https://techeducacion.org',
            isActive: true,
            category: 'EDUCATION'
        },
        {
            id: 'animal-rescue',
            name: 'Rescate Animal',
            description: 'Refugio y rehabilitación de animales abandonados y maltratados',
            mission: 'Dar una segunda oportunidad a los animales sin hogar',
            icon: '🐕',
            website: 'https://rescateanimal.org',
            isActive: true,
            category: 'ANIMALS'
        },
        {
            id: 'elderly-care',
            name: 'Cuidado Senior',
            description: 'Acompañamiento y asistencia a adultos mayores en situación de soledad',
            mission: 'Brindar dignidad y compañía a nuestros mayores',
            icon: '👴',
            website: 'https://cuidadosenior.org',
            isActive: true,
            category: 'HEALTH'
        }
    ];
    for (const ong of initialONGs) {
        const existingONG = await prisma.approvedONG.findUnique({
            where: { id: ong.id }
        });
        if (!existingONG) {
            await prisma.approvedONG.create({
                data: ong
            });
            console.log(`✅ Created ONG: ${ong.name}`);
        }
        else {
            console.log(`⏭️  ONG already exists: ${ong.name}`);
        }
    }
    console.log('🎉 Database seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
