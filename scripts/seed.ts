import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with initial ONGs...')

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
      category: 'CHILDREN' as const
    },
    {
      id: 'green-planet',
      name: 'Planeta Verde',
      description: 'Organización enfocada en la conservación del medio ambiente y reforestación',
      mission: 'Proteger y restaurar nuestro planeta para las futuras generaciones',
      icon: '🌱',
      website: 'https://planetaverde.org',
      isActive: true,
      category: 'ENVIRONMENT' as const
    },
    {
      id: 'tech-education',
      name: 'TechEducación',
      description: 'Enseñamos programación y tecnología a jóvenes en comunidades de bajos recursos',
      mission: 'Democratizar el acceso a la educación tecnológica',
      icon: '💻',
      website: 'https://techeducacion.org',
      isActive: true,
      category: 'EDUCATION' as const
    },
    {
      id: 'animal-rescue',
      name: 'Rescate Animal',
      description: 'Refugio y rehabilitación de animales abandonados y maltratados',
      mission: 'Dar una segunda oportunidad a los animales sin hogar',
      icon: '🐕',
      website: 'https://rescateanimal.org',
      isActive: true,
      category: 'ANIMALS' as const
    },
    {
      id: 'elderly-care',
      name: 'Cuidado Senior',
      description: 'Acompañamiento y asistencia a adultos mayores en situación de soledad',
      mission: 'Brindar dignidad y compañía a nuestros mayores',
      icon: '👴',
      website: 'https://cuidadosenior.org',
      isActive: true,
      category: 'HEALTH' as const
    }
  ]

  for (const ong of initialONGs) {
    const existingONG = await prisma.approvedONG.findUnique({
      where: { id: ong.id }
    })

    if (!existingONG) {
      await prisma.approvedONG.create({
        data: ong
      })
      console.log(`✅ Created ONG: ${ong.name}`)
    } else {
      console.log(`⏭️  ONG already exists: ${ong.name}`)
    }
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
