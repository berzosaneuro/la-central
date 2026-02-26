'use client'

import React, { useState, useEffect } from 'react'
import { Report, supabase } from '@/lib/supabase'

interface ReportsPanelProps {
  cloneId: string
  cloneName: string
  instanceId: string
  back: () => void
  toast: (msg: string) => void
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({ cloneId, cloneName, instanceId, back, toast }) => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [newReport, setNewReport] = useState({ title: '', type: 'daily' as const })

  useEffect(() => {
    fetchReports()
  }, [cloneId])

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('clone_id', cloneId)
      .order('generated_at', { ascending: false })
    
    if (data) setReports(data)
  }

  const generateReport = async () => {
    if (!newReport.title) {
      toast('Ingresa un título')
      return
    }

    setLoading(true)
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clone_id: cloneId,
        instance_id: instanceId,
        report_type: newReport.type,
        title: newReport.title,
        data: {
          generated_by: cloneName,
          generated_at: new Date().toISOString(),
          metrics: {
            total_tasks: Math.floor(Math.random() * 100),
            completed: Math.floor(Math.random() * 50),
            performance: Math.floor(Math.random() * 100)
          }
        }
      })
    })

    if (res.ok) {
      toast('Reporte generado')
      setNewReport({ title: '', type: 'daily' })
      fetchReports()
    } else {
      toast('Error al generar reporte')
    }
    setLoading(false)
  }

  const downloadReport = (report: Report) => {
    const csv = `Reporte: ${report.title}\nFecha: ${new Date(report.generated_at).toLocaleDateString()}\n\nDatos:\n${JSON.stringify(report.data, null, 2)}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title}.csv`
    a.click()
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', background: '#0a1e3e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 700 }}>Reportes - {cloneName}</h2>
        <button onClick={back} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '14px' }}>← Volver</button>
      </div>

      {/* Generar reporte */}
      <div style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
        <label style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Generar Nuevo Reporte</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            placeholder="Título del reporte"
            value={newReport.title}
            onChange={e => setNewReport({ ...newReport, title: e.target.value })}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', fontSize: '12px' }}
          />
          <select
            value={newReport.type}
            onChange={e => setNewReport({ ...newReport, type: e.target.value as any })}
            style={{ padding: '8px', borderRadius: '4px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', fontSize: '12px' }}
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: loading ? '#666' : '#00d4ff', color: '#051630', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px' }}
        >
          {loading ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>

      {/* Lista de reportes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', background: '#051630', borderRadius: '8px', border: '1px solid #00d4ff33' }}>
        {reports.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Sin reportes</div>
        ) : (
          reports.map(report => (
            <div key={report.id} style={{ padding: '12px', marginBottom: '8px', background: '#0a3050', borderRadius: '4px', border: '1px solid #00d4ff22' }}>
              <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: '12px' }}>{report.title}</div>
              <div style={{ color: '#aaa', fontSize: '11px', margin: '4px 0' }}>
                {report.report_type.toUpperCase()} • {new Date(report.generated_at).toLocaleDateString()}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button
                  onClick={() => downloadReport(report)}
                  style={{ flex: 1, padding: '6px', background: '#00d4ff22', border: '1px solid #00d4ff', color: '#00d4ff', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                >
                  📥 Descargar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
