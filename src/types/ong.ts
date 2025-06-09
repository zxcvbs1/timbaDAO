export interface ONG {
  id: string
  name: string
  description: string
  mission: string
  color: 'cyan' | 'pink' | 'green' | 'purple' | 'orange'
  icon: string
  website?: string
}

export const ONGS: ONG[] = [
  {
    id: 'children-hope',
    name: 'Esperanza Infantil',
    description: 'Dedicados a brindar educación y alimentación a niños en situación vulnerable',
    mission: 'Construir un futuro mejor para los niños más necesitados',
    color: 'cyan',
    icon: '👶',
    website: 'https://esperanzainfantil.org'
  },
  {
    id: 'green-planet',
    name: 'Planeta Verde',
    description: 'Organización enfocada en la conservación del medio ambiente y reforestación',
    mission: 'Proteger y restaurar nuestro planeta para las futuras generaciones',
    color: 'green',
    icon: '🌱',
    website: 'https://planetaverde.org'
  },
  {
    id: 'tech-education',
    name: 'TechEducación',
    description: 'Enseñamos programación y tecnología a jóvenes en comunidades de bajos recursos',
    mission: 'Democratizar el acceso a la educación tecnológica',
    color: 'purple',
    icon: '💻',
    website: 'https://techeducacion.org'
  },
  {
    id: 'animal-rescue',
    name: 'Rescate Animal',
    description: 'Refugio y rehabilitación de animales abandonados y maltratados',
    mission: 'Dar una segunda oportunidad a los animales sin hogar',
    color: 'pink',
    icon: '🐕',
    website: 'https://rescateanimal.org'
  },
  {
    id: 'elderly-care',
    name: 'Cuidado Senior',
    description: 'Acompañamiento y asistencia a adultos mayores en situación de soledad',
    mission: 'Brindar dignidad y compañía a nuestros mayores',
    color: 'orange',
    icon: '👴',
    website: 'https://cuidadosenior.org'
  }
]