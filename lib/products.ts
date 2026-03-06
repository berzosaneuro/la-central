export interface Plan {
  id: string
  name: string
  description: string
  priceInCents: number
  priceLabel: string
  features: string[]
  meditationsIncluded: number
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Empieza a entrenar tu mente sin coste',
    priceInCents: 0,
    priceLabel: 'Gratis',
    features: [
      '3 meditaciones guiadas',
      'Test de ruido mental',
      'Acceso al método NEURO',
      'Comunidad básica',
    ],
    meditationsIncluded: 3,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Acceso completo a la biblioteca de meditaciones',
    priceInCents: 999,
    priceLabel: '9,99 € / mes',
    features: [
      '10 meditaciones guiadas',
      'Curso de 7 días incluido',
      'Test de ruido mental avanzado',
      'Seguimiento de progreso',
      'Acceso prioritario a nuevos contenidos',
    ],
    meditationsIncluded: 10,
    popular: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'La experiencia completa de transformación',
    priceInCents: 1499,
    priceLabel: '14,99 € / mes',
    features: [
      'Meditaciones ilimitadas',
      'Curso de 7 días + bonos exclusivos',
      'Sesión mensual 1:1 con Berzosa',
      'Biblioteca completa',
      'Acceso anticipado a programas',
      'Comunidad Gold privada',
    ],
    meditationsIncluded: 999,
  },
]
