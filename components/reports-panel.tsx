'use client'

import React, { useState, useEffect } from 'react'
import { supabase, Report } from '@/lib/supabase'

const T = {
  bg:"#000410",bgCard:"#0A1628",dark:"#050C18",
  border:"#1A5A8A",borderBright:"#2080C0",
  neon:"#00C8FF",neonBright:"#60E8FF",electric:"#3A9FFF",
  white:"#E0F4FF",gray:"#5A8AAA",
  red:"#FF4466",green:"#00FF80",orange:"#FFA040",yellow:"#FFE040",
}

const inp: React.CSSProperties = {
  width:"100%",padding:"10px 12px",borderRadius:8,
  background:T.dark,border:`1px solid ${T.border}66`,
  color:T.white,fontSize:12,fontFamily:"'Rajdhani',sans-serif",
  letterSpacing:"0.06em",outline:"none",
}

const STATUS_COLOR: Record<string, string> = {
  ready: T.green, pending: T.orange, archived: T.gray
}

interface ReportsPanelProps {
  cloneId: string
  cloneName: string
  instanceId: string
  back: () => void
  toast: (msg: string) => void
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({
  cloneId, cloneName, instanceId, back, toast
}) => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'daily' as Report['report_type'] })
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { fetchReports() }, [cloneId])

  const fetchReports = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('clone_id', cloneId)
      .order('generated_at', { ascending: false })
      .limit(20)
    if (data) setReports(data)
    setLoading(false)
  }

  const generateReport = async () => {
    if (!form.title.trim()) { toast('Ingresa un título'); return }
    setGenerating(true)
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clone_id: cloneId,
        instance_id: instanceId,
        report_type: form.type,
        title: form.title,
        data: {
          generado_por: cloneName,
          instancia: instanceId,
          periodo: form.type,
          metricas: {
            ingresos_totales: Math.floor(Math.random() * 5000),
            clientes_activos: Math.floor(Math.random() * 100),
            tareas_completadas: Math.floor(Math.random() * 50),
            rendimiento_pct: Math.floor(Math.random() * 100),
            tiempo_activo_hrs: Math.floor(Math.random() * 720),
          },
          estado: 'ready',
        }
      })
    })
    if (res.ok) {
      setForm({ title: '', type: 'daily' })
      toast('Reporte generado correctamente')
      fetchReports()
    } else {
      toast('Error al generar reporte')
    }
    setGenerating(false)
  }

  const downloadReport = (report: Report) => {
    const m = report.data?.metricas as Record<string, number> | undefined
    const lines = [
      `REPORTE: ${report.title}`,
      `TIPO: ${report.report_type.toUpperCase()}`,
      `CLON: ${report.clone_id}`,
      `FECHA: ${new Date(report.generated_at).toLocaleString('es-ES')}`,
      `ESTADO: ${report.status.toUpperCase()}`,
      '',
      'METRICAS:',
      ...(m ? Object.entries(m).map(([k, v]) => `  ${k}: ${v}`) : ['  Sin datos']),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/\s+/g, '_')}_${report.report_type}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast('Reporte descargado')
  }

  const archiveReport = async (id: string) => {
    await supabase.from('reports').update({ status: 'archived' }).eq('id', id)
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'archived' } : r))
    toast('Reporte archivado')
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:T.bg }}>
      {/* HEADER */}
      <div style={{ padding:'14px 16px 12px', background:T.bgCard, borderBottom:`1px solid ${T.border}44` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:T.white, fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.1em' }}>REPORTES</div>
            <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>{cloneName} · {reports.filter(r => r.status === 'ready').length} disponibles</div>
          </div>
          <button onClick={back} style={{ background:'none', border:`1px solid ${T.border}44`, borderRadius:8, padding:'6px 12px', color:T.neon, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif" }}>
            ← VOLVER
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10 }}>
        {/* GENERAR */}
        <div style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.border}44` }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.neon, letterSpacing:'0.1em', marginBottom:10 }}>GENERAR REPORTE</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input style={inp} placeholder="Título del reporte" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <select style={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Report['report_type'] })}>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="custom">Personalizado</option>
            </select>
            <button
              onClick={generateReport}
              disabled={generating}
              style={{
                padding:'11px 0', borderRadius:8,
                background:`linear-gradient(90deg,${T.neon}22,${T.electric}22)`,
                border:`1.5px solid ${T.neon}66`, color:T.neonBright,
                fontSize:11, fontWeight:700, cursor:generating ? 'not-allowed' : 'pointer',
                fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.15em',
                opacity:generating ? 0.5 : 1, transition:'all 0.2s',
              }}
            >
              {generating ? 'GENERANDO...' : 'GENERAR'}
            </button>
          </div>
        </div>

        {/* LISTA */}
        {loading
          ? <div style={{ color:T.gray, textAlign:'center', padding:20, fontSize:12 }}>Cargando reportes...</div>
          : reports.length === 0
            ? <div style={{ color:T.gray, textAlign:'center', padding:20, fontSize:12 }}>Sin reportes generados</div>
            : reports.map(r => {
                const m = r.data?.metricas as Record<string, number> | undefined
                const isOpen = expanded === r.id
                return (
                  <div key={r.id} style={{ background:T.bgCard, borderRadius:10, border:`1px solid ${r.status === 'archived' ? T.border+'33' : T.border+'66'}`, overflow:'hidden', opacity:r.status === 'archived' ? 0.6 : 1 }}>
                    <div
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      style={{ padding:12, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                    >
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:T.white, marginBottom:2 }}>{r.title}</div>
                        <div style={{ fontSize:10, color:T.gray }}>{r.report_type.toUpperCase()} · {new Date(r.generated_at).toLocaleDateString('es-ES')}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:STATUS_COLOR[r.status] || T.gray, background:`${STATUS_COLOR[r.status] || T.gray}22`, padding:'3px 7px', borderRadius:10 }}>
                          {r.status.toUpperCase()}
                        </span>
                        <span style={{ color:T.neon, fontSize:11 }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding:'0 12px 12px', borderTop:`1px solid ${T.border}33` }}>
                        {m && (
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:10, marginBottom:10 }}>
                            {Object.entries(m).map(([k, v]) => (
                              <div key={k} style={{ background:T.dark, borderRadius:8, padding:'8px 10px', border:`1px solid ${T.border}33` }}>
                                <div style={{ fontSize:9, color:T.gray, letterSpacing:'0.06em', textTransform:'uppercase' }}>{k.replace(/_/g, ' ')}</div>
                                <div style={{ fontSize:14, fontWeight:800, color:T.neonBright, marginTop:2 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => downloadReport(r)} style={{ flex:1, padding:'8px 0', borderRadius:8, background:`${T.green}22`, border:`1px solid ${T.green}66`, color:T.green, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", letterSpacing:'0.1em' }}>
                            DESCARGAR
                          </button>
                          {r.status !== 'archived' && (
                            <button onClick={() => archiveReport(r.id)} style={{ flex:1, padding:'8px 0', borderRadius:8, background:`${T.gray}22`, border:`1px solid ${T.gray}66`, color:T.gray, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", letterSpacing:'0.1em' }}>
                              ARCHIVAR
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
        }
        <div style={{ height:20 }} />
      </div>
    </div>
  )
}
