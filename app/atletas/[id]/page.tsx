'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useModal } from '@/lib/context'
import { useToast } from '@/lib/context'

/* Athlete data map (extends athletes list) */
const ATHLETES: Record<string, {
  name: string
  category: string
  avatar: string
  peso: string
  cintura: string
  hambre: string
  pesoTrend: string
  cinturaTrend: string
  hambreTrend: string
}> = {
  'laura-pro': {
    name: 'Laura Pro',
    category: 'WELLNESS • 2 WEEKS OUT',
    avatar: '👩',
    peso: '64.5kg', pesoTrend: '↓ 0.3kg',
    cintura: '60cm', cinturaTrend: '↓ 1cm',
    hambre: '8/10', hambreTrend: '↑ Alta',
  },
  'javi-m': {
    name: 'Javi M.',
    category: 'HIPERTROFIA',
    avatar: '💪',
    peso: '82.0kg', pesoTrend: '↑ 2.5kg',
    cintura: '84cm', cinturaTrend: '→ Estable',
    hambre: '6/10', hambreTrend: '→ Normal',
  },
  'carlos-r': {
    name: 'Carlos R.',
    category: 'DEFINICIÓN',
    avatar: '🏋️',
    peso: '78.0kg', pesoTrend: '→ Sin cambios',
    cintura: '88cm', cinturaTrend: '→ Sin cambios',
    hambre: '7/10', hambreTrend: '↑ Alta',
  },
  'raul-c': {
    name: 'Raúl C.',
    category: 'RECOMPOSICIÓN',
    avatar: '🔥',
    peso: '90.0kg', pesoTrend: '↓ 0.5kg',
    cintura: '92cm', cinturaTrend: '↓ 0.5cm',
    hambre: '5/10', hambreTrend: '→ Normal',
  },
  'maria-s': {
    name: 'María S.',
    category: 'POST-PARTO',
    avatar: '⭐',
    peso: '61.0kg', pesoTrend: '↓ 1.2kg',
    cintura: '72cm', cinturaTrend: '↓ 2cm',
    hambre: '4/10', hambreTrend: '↓ Baja',
  },
}

const BAR_DATA = [
  { day: 'Lun', ghost: 65, real: 60 },
  { day: 'Mar', ghost: 67, real: 62 },
  { day: 'Mié', ghost: 70, real: 65 },
  { day: 'Jue', ghost: 68, real: 63 },
  { day: 'Vie', ghost: 73, real: 68 },
  { day: 'Sáb', ghost: 75, real: 70 },
  { day: 'Dom', ghost: 74, real: 69 },
]

export default function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { showModal } = useModal()
  const { showToast } = useToast()
  const [vaultOpen, setVaultOpen] = useState(false)
  const [notes, setNotes] = useState(
    'Excelente adherencia al plan. Considerar aumentar carbohidratos en días de entrenamiento de pierna. Revisar hidratación pre-competición.'
  )

  const athlete = ATHLETES[id] ?? ATHLETES['laura-pro']

  const updateMetric = (type: 'peso' | 'cintura' | 'hambre') => {
    const titles = { peso: 'Actualizar Peso', cintura: 'Actualizar Medida de Cintura', hambre: 'Registrar Nivel de Hambre' }
    showModal({
      title: titles[type],
      body: (
        <div className="input-group">
          <label className="input-label">NUEVO VALOR</label>
          {type === 'hambre' ? (
            <input type="range" className="cyber-input" min={1} max={10} defaultValue={8} />
          ) : (
            <input type="number" className="cyber-input" step={type === 'peso' ? 0.1 : 0.5} />
          )}
        </div>
      ),
      confirmText: 'GUARDAR',
      onConfirm: () => showToast('✅ Métrica actualizada correctamente'),
    })
  }

  const addProgressData = () =>
    showModal({
      title: 'Añadir Datos de Progreso',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">PESO (kg)</label>
            <input type="number" className="cyber-input" step={0.1} />
          </div>
          <div className="input-group">
            <label className="input-label">FECHA</label>
            <input type="date" className="cyber-input" />
          </div>
        </>
      ),
      confirmText: 'AÑADIR',
      onConfirm: () => showToast('✅ Datos añadidos al gráfico'),
    })

  const createReport = () =>
    showModal({
      title: 'Crear Nuevo Reporte',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">TÍTULO DEL REPORTE</label>
            <input className="cyber-input" placeholder="Ej: Revisión Semanal" />
          </div>
          <div className="input-group">
            <label className="input-label">NOTAS</label>
            <textarea className="cyber-input" rows={4} placeholder="Observaciones del progreso..." />
          </div>
        </>
      ),
      confirmText: 'CREAR REPORTE',
      onConfirm: () => showToast('✅ Reporte creado correctamente'),
    })

  const editNotes = () =>
    showModal({
      title: 'Editar Notas del Entrenador',
      body: (
        <div className="input-group">
          <label className="input-label">NOTAS</label>
          <textarea className="cyber-input" rows={6} defaultValue={notes}
            onChange={e => setNotes(e.target.value)} />
        </div>
      ),
      confirmText: 'GUARDAR',
      onConfirm: () => showToast('✅ Notas actualizadas'),
    })

  const editProtocol = () =>
    showModal({
      title: 'Editar Protocolo',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">COMPUESTO</label>
            <input className="cyber-input" placeholder="Ej: PRIMOBOLAN" />
          </div>
          <div className="input-group">
            <label className="input-label">DOSIFICACIÓN</label>
            <input className="cyber-input" placeholder="Ej: 200mg/sem" />
          </div>
        </>
      ),
      confirmText: 'GUARDAR CAMBIOS',
      onConfirm: () => showToast('✅ Protocolo actualizado'),
    })

  return (
    <div className="screen-enter">
      {/* ATHLETE HEADER */}
      <div className="header">
        <div className="avatar-container">
          <div className="avatar-3d">{athlete.avatar}</div>
          <div className="athlete-info">
            <h2>{athlete.name}</h2>
            <div className="athlete-status">{athlete.category}</div>
          </div>
        </div>
        <div
          className="close-btn"
          style={{ borderRadius: 8 }}
          onClick={() => router.push('/atletas')}
        >
          ←
        </div>
      </div>

      {/* LIVE METRICS */}
      <div className="live-panel">
        <div className="live-item" style={{ animationDelay: '0.1s' }} onClick={() => updateMetric('peso')}>
          <div className="label-neon">PESO HOY</div>
          <div className="value-chrome">{athlete.peso}</div>
          <div className="trend down">{athlete.pesoTrend}</div>
        </div>
        <div className="live-item" style={{ animationDelay: '0.2s' }} onClick={() => updateMetric('cintura')}>
          <div className="label-neon">CINTURA</div>
          <div className="value-chrome">{athlete.cintura}</div>
          <div className="trend down">{athlete.cinturaTrend}</div>
        </div>
        <div className="live-item" style={{ animationDelay: '0.3s' }} onClick={() => updateMetric('hambre')}>
          <div className="label-neon">HAMBRE</div>
          <div className="value-chrome">{athlete.hambre}</div>
          <div className="trend up">{athlete.hambreTrend}</div>
        </div>
      </div>

      {/* PROGRESS GRAPH */}
      <div className="cyber-card">
        <div className="card-header">
          <div className="card-icon">📊</div>
          <div className="card-title">PROGRESO & CICLO</div>
          <div className="card-action tooltip" data-tooltip="Agregar datos" onClick={addProgressData}>+</div>
        </div>
        <div className="graph-container">
          <div className="menstrual-zone">
            <div className="zone-label">FASE LÚTEA</div>
          </div>
          <div className="bars-container">
            {BAR_DATA.map((bar, i) => (
              <div
                key={i}
                className="bar-wrapper tooltip"
                data-tooltip={`${bar.day}: ${bar.real}kg`}
              >
                <div className="bar-ghost" style={{ height: bar.ghost }} />
                <div
                  className="bar-real"
                  style={{ height: bar.real, animationDelay: `${0.1 * (i + 1)}s` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="text-small" style={{ textAlign: 'center', marginTop: 15 }}>
          *Zona sombreada: Retención hídrica prevista
        </div>
      </div>

      {/* VAULT BUTTON */}
      <div
        className="cyber-button secondary"
        style={{ margin: '0 20px' }}
        onClick={() => setVaultOpen(true)}
      >
        <span className="button-text">🔒 ABRIR PROTOCOLOS (SECURE)</span>
      </div>

      {/* REPORTS */}
      <div className="cyber-card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-icon">📁</div>
          <div className="card-title">HISTORIAL DE REPORTES</div>
          <div className="card-action tooltip" data-tooltip="Crear reporte" onClick={createReport}>+</div>
        </div>
        <div className="row">
          <span className="text-chrome">📁 Revisión 30 Ene (Hoy)</span>
          <span className="text-neon" style={{ cursor: 'pointer' }}>👁️</span>
        </div>
        <div className="divider" />
        <div className="row">
          <span className="text-chrome">📁 Revisión 23 Ene</span>
          <span className="text-metal" style={{ cursor: 'pointer' }}>👁️</span>
        </div>
        <div className="divider" />
        <div className="row">
          <span className="text-chrome">📁 Revisión 15 Ene</span>
          <span className="text-metal" style={{ cursor: 'pointer' }}>👁️</span>
        </div>
      </div>

      {/* NOTES */}
      <div className="cyber-card">
        <div className="card-header">
          <div className="card-icon">💬</div>
          <div className="card-title">NOTAS DEL ENTRENADOR</div>
        </div>
        <div
          className="text-chrome editable"
          onClick={editNotes}
          style={{
            minHeight: 60, padding: 10,
            background: 'rgba(0,0,0,0.3)', borderRadius: 6,
          }}
        >
          {notes}
        </div>
      </div>

      {/* ── VAULT OVERLAY ── */}
      <div className={`vault-overlay${vaultOpen ? ' open' : ''}`}>
        <div className="vault-header">
          <div className="vault-title">THE VAULT 🔓</div>
          <div className="close-btn" onClick={() => setVaultOpen(false)}>✕</div>
        </div>

        <div className="cyber-card">
          <div className="card-header">
            <div className="card-icon">🛡️</div>
            <div className="card-title">CICLO ACTIVO (WEEKS 2-1)</div>
            <div className="card-action tooltip" data-tooltip="Editar protocolo" onClick={editProtocol}>✏️</div>
          </div>
          <div className="row">
            <span className="text-chrome">PRIMOBOLAN</span>
            <span className="text-neon editable">200mg/sem</span>
          </div>
          <div className="divider" />
          <div className="row">
            <span className="text-chrome">CLEMBUTEROL</span>
            <span className="text-neon editable">40mcg (Pre-C)</span>
          </div>
          <div className="divider" />
          <div className="row">
            <span className="text-chrome">TELMISARTAN (Protector)</span>
            <span className="text-chrome editable">40mg/día</span>
          </div>
        </div>

        <div className="cyber-card">
          <div className="card-header">
            <div className="card-icon">📋</div>
            <div className="card-title">ANALÍTICAS DE CONTROL</div>
          </div>
          <div className="row">
            <span className="text-chrome">Última analítica</span>
            <span className="text-neon">15 Ene 2026</span>
          </div>
          <div className="row">
            <span className="text-chrome">Próxima recomendada</span>
            <span style={{ color: 'var(--warning)' }}>15 Feb 2026</span>
          </div>
          <div className="divider" />
          <div className="text-small">
            Valores dentro de rango óptimo. Función hepática normal. Lípidos controlados.
          </div>
        </div>

        <div className="cyber-card" style={{ border: '1px solid var(--chrome)' }}>
          <div className="card-header">
            <div style={{ fontSize: 24, marginRight: 10 }}>🧠</div>
            <div className="card-title">NEURO-MODULATOR AI</div>
          </div>
          <div className="text-chrome">⚠️ El Clembuterol está activando el SNC nocturno.</div>
          <div className="ai-box">
            <div className="text-neon" style={{ fontWeight: 700, marginBottom: 8 }}>
              SUGERENCIA ACTIVADA:
            </div>
            <div className="text-chrome">+ 500mg Magnesio Bisglicinato</div>
            <div className="text-chrome">+ 3g Glicina (Pre-cama)</div>
            <div className="text-chrome">+ Considerar reducir dosis nocturna a 20mcg</div>
          </div>
          <div
            className="cyber-button secondary"
            style={{ marginTop: 15 }}
            onClick={() => showToast('🤖 Sugerencia de IA aplicada al protocolo')}
          >
            <span className="button-text">✓ APLICAR SUGERENCIA</span>
          </div>
        </div>

        <div className="cyber-card alert">
          <div className="card-header">
            <div className="card-icon alert">⚠️</div>
            <div className="card-title alert">ADVERTENCIA MÉDICA</div>
          </div>
          <div className="text-chrome" style={{ fontSize: 13, lineHeight: 1.8 }}>
            Esta información es confidencial y está protegida bajo secreto profesional. El uso de
            sustancias controladas debe realizarse exclusivamente bajo supervisión médica
            especializada y cumpliendo con la legislación vigente.
          </div>
        </div>

        {/* Space for bottom padding */}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
