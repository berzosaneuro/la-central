'use client'

import { useState } from 'react'
import { useModal } from '@/lib/context'
import { useToast } from '@/lib/context'

export default function OfiPage() {
  const { showModal } = useModal()
  const { showToast } = useToast()
  const [expensesOpen, setExpensesOpen] = useState(false)

  const editFinance = () =>
    showModal({
      title: 'Editar Facturación',
      body: (
        <div className="input-group">
          <label className="input-label">MONTO (€)</label>
          <input type="number" className="cyber-input" placeholder="5000" step={50} />
        </div>
      ),
      confirmText: 'ACTUALIZAR',
      onConfirm: () => showToast('✅ Facturación actualizada'),
    })

  const editExpense = (label: string) =>
    showModal({
      title: `Editar Gasto: ${label}`,
      body: (
        <div className="input-group">
          <label className="input-label">MONTO (€)</label>
          <input type="number" className="cyber-input" step={10} />
        </div>
      ),
      confirmText: 'ACTUALIZAR',
      onConfirm: () => showToast('✅ Gasto actualizado'),
    })

  const addExpense = () =>
    showModal({
      title: 'Añadir Nuevo Gasto',
      body: (
        <>
          <div className="input-group">
            <label className="input-label">CONCEPTO</label>
            <input className="cyber-input" placeholder="Ej: Marketing digital" />
          </div>
          <div className="input-group">
            <label className="input-label">MONTO (€)</label>
            <input type="number" className="cyber-input" placeholder="150" step={10} />
          </div>
        </>
      ),
      confirmText: 'AÑADIR GASTO',
      onConfirm: () => showToast('✅ Gasto añadido'),
    })

  const claimPayment = () =>
    showModal({
      title: 'Reclamar Pago',
      body: (
        <>
          <p className="text-chrome">¿Deseas enviar un recordatorio de pago a Carlos Rodríguez?</p>
          <p className="text-small" style={{ marginTop: 10 }}>
            Se enviará un mensaje automático con los detalles del pago pendiente.
          </p>
        </>
      ),
      confirmText: 'ENVIAR RECORDATORIO',
      onConfirm: () => showToast('📧 Recordatorio de pago enviado'),
    })

  return (
    <div className="screen-enter">
      <div className="header">
        <div className="header-title">THE OFFICE 💼</div>
      </div>

      {/* FINANCE CARD */}
      <div className="finance-card">
        <div className="finance-row">
          <span className="finance-label">FACTURACIÓN BRUTA</span>
          <span className="finance-value editable" onClick={editFinance}>
            5.000 €
          </span>
        </div>

        <div
          className="finance-row expandable"
          onClick={() => setExpensesOpen(v => !v)}
        >
          <span className="finance-label">
            (-) GASTOS OPERATIVOS{' '}
            <span>{expensesOpen ? '▲' : '▼'}</span>
          </span>
          <span className="finance-value" style={{ color: 'var(--metal-grey)' }}>
            -1.200 €
          </span>
        </div>

        <div className={`expenses-box${expensesOpen ? ' open' : ''}`}>
          {[
            { icon: '💡', label: 'Luz/Local', value: '-200 €' },
            { icon: '🏛️', label: 'Autónomo', value: '-300 €' },
            { icon: '🛒', label: 'Súper/Comida', value: '-700 €' },
          ].map(exp => (
            <div key={exp.label} className="row">
              <span className="text-small">{exp.icon} {exp.label}</span>
              <span
                className="text-small editable"
                onClick={() => editExpense(exp.label)}
              >
                {exp.value}
              </span>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <span
              className="text-neon"
              style={{ fontSize: 12, cursor: 'pointer' }}
              onClick={addExpense}
            >
              + AÑADIR GASTO
            </span>
          </div>
        </div>

        <div style={{ height: 1, background: '#333', margin: '20px 0' }} />

        <div className="finance-row">
          <span className="finance-label" style={{ fontSize: 18, fontWeight: 700 }}>
            BENEFICIO NETO
          </span>
          <span className="finance-total">3.800 €</span>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #222' }}>
          <div className="row">
            <span className="text-small">Margen de beneficio</span>
            <span className="text-neon">76%</span>
          </div>
          <div className="row">
            <span className="text-small">Comparado mes anterior</span>
            <span className="trend up">↑ +8.5%</span>
          </div>
        </div>
      </div>

      {/* INGRESOS POR CLIENTE */}
      <div className="cyber-card">
        <div className="card-header">
          <div className="card-icon">💰</div>
          <div className="card-title">INGRESOS POR CLIENTE</div>
        </div>
        {[
          { name: 'Laura Pro - Plan Premium', amount: '350€/mes' },
          { name: 'Javi M. - Plan Estándar', amount: '180€/mes' },
          { name: 'María S. - Plan Básico', amount: '120€/mes' },
        ].map(c => (
          <div key={c.name} className="row">
            <span className="text-chrome">{c.name}</span>
            <span className="text-neon">{c.amount}</span>
          </div>
        ))}
      </div>

      {/* INCIDENCIAS */}
      <div className="text-metal" style={{ margin: '20px 20px 10px', fontWeight: 600 }}>
        INCIDENCIAS DE COBRO
      </div>

      <div className="cyber-card">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div className="text-chrome" style={{ fontWeight: 700 }}>Carlos Rodríguez</div>
            <div className="text-chrome" style={{ fontSize: 12 }}>
              Plan Trimestral •{' '}
              <span style={{ color: 'var(--danger)' }}>RETRASO (+5 DÍAS)</span>
            </div>
            <div className="text-small" style={{ marginTop: 5 }}>
              Último contacto: 25 Ene • Monto: 450€
            </div>
          </div>
          <div className="cyber-button danger small" onClick={claimPayment}>
            <span className="button-text small">RECLAMAR</span>
          </div>
        </div>
      </div>

      {/* PROYECCIÓN */}
      <div className="cyber-card">
        <div className="card-header">
          <div className="card-icon">📈</div>
          <div className="card-title">PROYECCIÓN MENSUAL</div>
        </div>
        <div className="text-small" style={{ marginBottom: 15 }}>
          Basado en tus métricas actuales de retención y nuevos clientes
        </div>
        <div className="row">
          <span className="text-metal">Próximo mes (Estimado)</span>
          <span className="text-neon">5.450 €</span>
        </div>
        <div className="row">
          <span className="text-metal">Trimestre (Proyección)</span>
          <span className="text-neon">16.200 €</span>
        </div>
      </div>
    </div>
  )
}
