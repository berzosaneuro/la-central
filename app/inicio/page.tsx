'use client'

import { useState } from 'react'
import { useModal } from '@/lib/context'
import { useToast } from '@/lib/context'

export default function InicioPage() {
  const { showModal } = useModal()
  const { showToast } = useToast()
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set())

  const completeTask = (index: number) => {
    setCompletedTasks(prev => new Set([...prev, index]))
    showToast('✅ Tarea completada')
  }

  const copyLink = () => {
    const link =
      'https://titan-os.app/onboarding/new-client-' +
      Math.random().toString(36).substr(2, 9)
    navigator.clipboard
      .writeText(link)
      .then(() => showToast('✅ Enlace copiado al portapapeles'))
      .catch(() =>
        showModal({
          title: 'Enlace de Onboarding',
          body: <p className="text-chrome" style={{ wordBreak: 'break-all' }}>{link}</p>,
          confirmText: 'CERRAR',
        })
      )
  }

  const showNotifications = () => {
    showModal({
      title: '🔔 Notificaciones',
      body: (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <div className="cyber-card" style={{ margin: '10px 0', padding: 15 }}>
            <div className="text-chrome" style={{ fontWeight: 700 }}>Check-in recibido</div>
            <div className="text-small">Javi M. ha enviado su check-in semanal • Hace 2 horas</div>
          </div>
          <div className="cyber-card" style={{ margin: '10px 0', padding: 15 }}>
            <div className="text-chrome" style={{ fontWeight: 700 }}>Pago confirmado</div>
            <div className="text-small">María S. - Plan mensual • Hace 5 horas</div>
          </div>
          <div className="cyber-card alert" style={{ margin: '10px 0', padding: 15 }}>
            <div className="text-chrome" style={{ fontWeight: 700 }}>Alerta de progreso</div>
            <div className="text-small">Carlos R. sin cambios significativos • Hace 1 día</div>
          </div>
        </div>
      ),
      confirmText: 'CERRAR',
    })
  }

  const contactClient = () => {
    showModal({
      title: 'Contactar con Carlos R.',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">ASUNTO</label>
            <input className="cyber-input" defaultValue="Revisión de progreso" />
          </div>
          <div className="input-group">
            <label className="input-label">MENSAJE</label>
            <textarea
              className="cyber-input"
              rows={4}
              defaultValue="Hola Carlos R., he notado que tu progreso se ha estancado. ¿Podemos agendar una llamada para ajustar tu plan?"
            />
          </div>
        </>
      ),
      confirmText: 'ENVIAR MENSAJE',
      onConfirm: () => showToast('📤 Mensaje enviado a Carlos R.'),
    })
  }

  const addEvent = () => {
    showModal({
      title: 'Añadir Evento a la Agenda',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">HORA</label>
            <input type="time" className="cyber-input" defaultValue="14:00" />
          </div>
          <div className="input-group">
            <label className="input-label">DESCRIPCIÓN</label>
            <input className="cyber-input" placeholder="Ej: Revisión con cliente" />
          </div>
        </>
      ),
      confirmText: 'AÑADIR',
      onConfirm: () => showToast('✅ Evento añadido a la agenda'),
    })
  }

  const SCHEDULE = [
    { time: '09:00', desc: 'Revisión Javi M. (Check-in Recibido)' },
    { time: '11:30', desc: 'Videollamada Estrategia (Raúl C.)' },
    { time: '15:00', desc: 'Actualizar planes de nutrición' },
  ]

  return (
    <div className="screen-enter">
      {/* HEADER */}
      <div className="header">
        <div className="header-title">
          TITAN OS <span className="version">v3.0</span>
        </div>
        <div
          className="icon-3d tooltip"
          data-tooltip="3 notificaciones"
          onClick={showNotifications}
        >
          🔔
          <span className="notification-badge">3</span>
        </div>
      </div>

      {/* ALERT */}
      {!alertDismissed && (
        <div className="cyber-card alert" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">
            <div className="card-icon alert">⚠️</div>
            <div className="card-title alert">ATENCIÓN REQUERIDA</div>
            <div className="card-action" onClick={() => setAlertDismissed(true)}>✕</div>
          </div>
          <div className="text-chrome">
            Detectada rutina estancada en <strong>Carlos R.</strong> (14 semanas).
          </div>
          <div className="text-chrome" style={{ marginTop: 8 }}>
            ⚠️ <span style={{ color: 'var(--danger)' }}>Riesgo de abandono alto.</span>
          </div>
          <div
            className="cyber-button danger"
            style={{ marginTop: 15 }}
            onClick={contactClient}
          >
            <span className="button-text">📞 CONTACTAR AHORA</span>
          </div>
        </div>
      )}

      {/* AGENDA */}
      <div className="cyber-card" style={{ animationDelay: '0.2s' }}>
        <div className="card-header">
          <div className="card-icon">📅</div>
          <div className="card-title">AGENDA DEL DÍA</div>
          <div className="card-action tooltip" data-tooltip="Añadir evento" onClick={addEvent}>
            +
          </div>
        </div>
        {SCHEDULE.map((item, i) => (
          <div key={i}>
            <div className="row">
              <span className="time-neon">{item.time}</span>
              <span
                className="text-chrome"
                style={
                  completedTasks.has(i)
                    ? { opacity: 0.5, textDecoration: 'line-through' }
                    : {}
                }
              >
                {item.desc}
              </span>
              <span
                style={{
                  cursor: 'pointer',
                  color: completedTasks.has(i) ? 'var(--success)' : undefined,
                }}
                onClick={() => completeTask(i)}
              >
                ✓
              </span>
            </div>
            {i < SCHEDULE.length - 1 && <div className="divider" />}
          </div>
        ))}
      </div>

      {/* NUEVO INGRESO */}
      <div className="cyber-card" style={{ animationDelay: '0.3s' }}>
        <div className="card-header">
          <div className="card-icon">🔗</div>
          <div className="card-title">NUEVO INGRESO</div>
        </div>
        <div className="text-small">
          Envía este enlace para que el cliente rellene su ficha, fotos y alergias automáticamente.
        </div>
        <div className="cyber-button" onClick={copyLink}>
          <span className="button-text">📋 COPIAR ENLACE DE ALTA</span>
        </div>
      </div>

      {/* RESUMEN SEMANAL */}
      <div className="cyber-card" style={{ animationDelay: '0.4s' }}>
        <div className="card-header">
          <div className="card-icon">📊</div>
          <div className="card-title">RESUMEN SEMANAL</div>
        </div>
        <div className="row">
          <span className="text-metal">Check-ins recibidos</span>
          <span className="text-neon">23/28</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '82%' }} />
        </div>
        <div className="divider" />
        <div className="row">
          <span className="text-metal">Sesiones completadas</span>
          <span className="text-neon">18/20</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: '90%' }} />
        </div>
      </div>
    </div>
  )
}
