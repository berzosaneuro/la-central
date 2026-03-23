'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Athlete {
  id: string
  name: string
  status: 'active' | 'warning' | 'danger'
  info: string
}

const ATHLETES: Athlete[] = [
  {
    id: 'laura-pro',
    name: 'Laura Pro',
    status: 'active',
    info: 'WELLNESS • 2 WEEKS OUT • Última actualización: Hoy',
  },
  {
    id: 'javi-m',
    name: 'Javi M.',
    status: 'active',
    info: 'HIPERTROFIA • Check-in recibido • Progreso: +2.5kg',
  },
  {
    id: 'carlos-r',
    name: 'Carlos R.',
    status: 'danger',
    info: 'DEFINICIÓN • ⚠️ Sin cambios (14 semanas) • Requiere atención',
  },
  {
    id: 'raul-c',
    name: 'Raúl C.',
    status: 'warning',
    info: 'RECOMPOSICIÓN • Pendiente check-in semanal',
  },
  {
    id: 'maria-s',
    name: 'María S.',
    status: 'active',
    info: 'POST-PARTO • Fase de adaptación • Progreso excelente',
  },
]

export default function AtletasPage() {
  const [query, setQuery] = useState('')

  const filtered = ATHLETES.filter(
    a =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.info.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="screen-enter">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar atleta..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div id="athletes-list">
        {filtered.map(athlete => (
          <Link
            key={athlete.id}
            href={`/atletas/${athlete.id}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className="client-list-item">
              <div className="client-name">
                <span className={`status-indicator ${athlete.status}`} />
                {athlete.name}
              </div>
              <div className="client-status">{athlete.info}</div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--metal-grey)' }}>
            No se encontraron atletas
          </div>
        )}
      </div>
    </div>
  )
}
