'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase, subscribeToUpdates, CloneUpdate } from '@/lib/supabase'

const T = {
  bg:"#000410",bgCard:"#0A1628",dark:"#050C18",
  border:"#1A5A8A",borderBright:"#2080C0",
  neon:"#00C8FF",neonBright:"#60E8FF",electric:"#3A9FFF",
  white:"#E0F4FF",gray:"#5A8AAA",
  red:"#FF4466",green:"#00FF80",orange:"#FFA040",yellow:"#FFE040",
}

const STATUS_COLOR: Record<string, string> = {
  pending: T.gray, downloading: T.neon, installing: T.orange,
  complete: T.green, error: T.red,
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'PENDIENTE', downloading: 'DESCARGANDO', installing: 'INSTALANDO',
  complete: 'COMPLETO', error: 'ERROR',
}

interface UpdatesPanelProps {
  instanceId: string
  clones: Array<{ id: string; name: string; vi: string; vd: string }>
  back: () => void
  toast: (msg: string) => void
}

export const UpdatesPanel: React.FC<UpdatesPanelProps> = ({
  instanceId, clones, back, toast
}) => {
  const [updates, setUpdates] = useState<CloneUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [versionInput, setVersionInput] = useState('')
  const [targetClone, setTargetClone] = useState<'all' | string>('all')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchUpdates()
    // Realtime para todos los clones
    const subs = clones.map(c =>
      subscribeToUpdates(c.id, (upd) => {
        setUpdates(prev => prev.map(u => u.id === upd.id ? upd : u))
      })
    )
    return () => {
      subs.forEach(s => s.unsubscribe())
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [clones])

  const fetchUpdates = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('clone_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setUpdates(data)
    setLoading(false)
  }

  const deployVersion = async () => {
    const version = versionInput.trim() || 'latest'
    setDeploying(true)

    const targets = targetClone === 'all' ? clones : clones.filter(c => c.id === targetClone)
    let errors = 0

    for (const clone of targets) {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clone_id: clone.id, instance_id: instanceId, version })
      })
      if (!res.ok) errors++
    }

    if (errors === 0) {
      toast(`Deploy v${version} iniciado en ${targets.length} clon${targets.length !== 1 ? 'es' : ''}`)
      setVersionInput('')
    } else {
      toast(`${errors} errores en el deploy`)
    }

    fetchUpdates()
    setDeploying(false)
  }

  const simulateProgress = async (upd: CloneUpdate) => {
    const next = Math.min(upd.progress + 25, 100)
    const status: CloneUpdate['status'] = next === 100 ? 'complete' : next > 50 ? 'installing' : 'downloading'
    const res = await fetch('/api/updates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: upd.id, status, progress: next })
    })
    if (res.ok) {
      setUpdates(prev => prev.map(u => u.id === upd.id ? { ...u, status, progress: next } : u))
    }
  }

  const clonesWithUpdates = clones.filter(c => {
    const [ma, mi] = c.vi.split('.').map(Number)
    const [md, mdi] = c.vd.split('.').map(Number)
    return md > ma || (md === ma && mdi > mi)
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:T.bg }}>
      {/* HEADER */}
      <div style={{ padding:'14px 16px 12px', background:T.bgCard, borderBottom:`1px solid ${T.border}44` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:T.white, fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.1em' }}>ACTUALIZACIONES</div>
            <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>{instanceId} · {clonesWithUpdates.length} pendientes</div>
          </div>
          <button onClick={back} style={{ background:'none', border:`1px solid ${T.border}44`, borderRadius:8, padding:'6px 12px', color:T.neon, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif" }}>
            ← VOLVER
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10 }}>
        {/* CLONES CON ACTUALIZACIONES DISPONIBLES */}
        {clonesWithUpdates.length > 0 && (
          <div style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.orange}44` }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.orange, letterSpacing:'0.1em', marginBottom:8 }}>ACTUALIZACIONES DISPONIBLES</div>
            {clonesWithUpdates.map(c => (
              <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${T.border}22` }}>
                <div style={{ fontSize:12, color:T.white, fontWeight:700 }}>{c.name}</div>
                <div style={{ fontSize:11, color:T.gray }}>{c.vi} → <span style={{ color:T.neon }}>{c.vd}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* DEPLOY */}
        <div style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.border}44` }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.neon, letterSpacing:'0.1em', marginBottom:10 }}>DESPLEGAR VERSIÓN</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <select
              value={targetClone}
              onChange={e => setTargetClone(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.dark, border:`1px solid ${T.border}66`, color:T.white, fontSize:12, fontFamily:"'Rajdhani',sans-serif" }}
            >
              <option value="all">TODOS LOS CLONES</option>
              {clones.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:T.dark, border:`1px solid ${T.border}66`, color:T.white, fontSize:12, fontFamily:"'Rajdhani',sans-serif", letterSpacing:'0.06em', outline:'none' }}
              placeholder="Versión (ej: 2.5.0) — vacío = latest"
              value={versionInput}
              onChange={e => setVersionInput(e.target.value)}
            />
            <button
              onClick={deployVersion}
              disabled={deploying}
              style={{
                padding:'12px 0', borderRadius:10,
                background:`linear-gradient(90deg,${T.green}22,${T.neon}22)`,
                border:`1.5px solid ${T.green}66`, color:T.green,
                fontSize:12, fontWeight:700, cursor:deploying ? 'not-allowed' : 'pointer',
                fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.15em',
                opacity:deploying ? 0.5 : 1, transition:'all 0.2s',
                textShadow:`0 0 12px ${T.green}88`,
              }}
            >
              {deploying ? 'DESPLEGANDO...' : 'INICIAR DEPLOY'}
            </button>
          </div>
        </div>

        {/* HISTORIAL */}
        <div style={{ fontSize:11, fontWeight:700, color:T.gray, letterSpacing:'0.1em' }}>HISTORIAL</div>
        {loading
          ? <div style={{ color:T.gray, textAlign:'center', padding:20, fontSize:12 }}>Cargando...</div>
          : updates.length === 0
            ? <div style={{ color:T.gray, textAlign:'center', padding:20, fontSize:12 }}>Sin historial de actualizaciones</div>
            : updates.map(upd => {
                const sc = STATUS_COLOR[upd.status] || T.gray
                return (
                  <div key={upd.id} style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${sc}33` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:T.white }}>
                          {clones.find(c => c.id === upd.clone_id)?.name || upd.clone_id}
                        </div>
                        <div style={{ fontSize:10, color:T.gray, marginTop:2 }}>v{upd.version} · {new Date(upd.created_at).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, color:sc, background:`${sc}22`, padding:'3px 8px', borderRadius:10 }}>
                        {STATUS_LABEL[upd.status]}
                      </span>
                    </div>
                    {/* PROGRESS BAR */}
                    <div style={{ background:T.dark, borderRadius:4, height:5, overflow:'hidden', marginBottom:6 }}>
                      <div style={{ height:'100%', width:`${upd.progress}%`, background:`linear-gradient(90deg,${T.neon},${T.electric})`, borderRadius:4, transition:'width 0.4s ease', boxShadow:`0 0 8px ${T.neon}66` }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:T.gray }}>
                      <span>{upd.progress}%</span>
                      {upd.error_message && <span style={{ color:T.red }}>{upd.error_message}</span>}
                    </div>
                    {upd.status !== 'complete' && upd.status !== 'error' && (
                      <button
                        onClick={() => simulateProgress(upd)}
                        style={{ marginTop:8, width:'100%', padding:'7px 0', borderRadius:8, background:`${T.neon}11`, border:`1px solid ${T.neon}44`, color:T.neon, fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", letterSpacing:'0.08em' }}
                      >
                        SIMULAR PROGRESO +25%
                      </button>
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
