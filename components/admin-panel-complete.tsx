'use client'

import React, { useState, useEffect } from 'react'
import { supabase, InstanceConfig } from '@/lib/supabase'
import { MessagingPanel } from './messaging-panel'
import { ReportsPanel } from './reports-panel'
import { UpdatesPanel } from './updates-panel'

// ── TEMA: idéntico al OS ──────────────────────────────────────
const T = {
  bg:"#000410", bgCard:"#0A1628", bgCardLight:"#0D1E35", dark:"#050C18",
  border:"#1A5A8A", borderBright:"#2080C0",
  neon:"#00C8FF", neonBright:"#60E8FF", electric:"#3A9FFF",
  white:"#E0F4FF", gray:"#5A8AAA",
  red:"#FF4466", green:"#00FF80", orange:"#FFA040", yellow:"#FFE040",
}

const APP_VERSION = "5.1.0"

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const inp: React.CSSProperties = {
  width:"100%", padding:"10px 12px", borderRadius:8,
  background:T.dark, border:`1px solid ${T.border}66`,
  color:T.white, fontSize:12, fontFamily:"'Rajdhani',sans-serif",
  letterSpacing:"0.06em", outline:"none",
}

// ── TIPOS ─────────────────────────────────────────────────────
interface Clone {
  id: string; name: string; vi: string; vd: string;
  estado: string; server: string; ingresos?: number
}

interface Instance {
  id: string; nombre: string; pais: string
  clones: number; estado: "ONLINE" | "OFFLINE"
  ultimaSync: string; ingresos: number
}

type Tab = 'overview' | 'messaging' | 'reports' | 'updates' | 'config-local' | 'config-filiales'

interface AdminPanelCompleteProps {
  back: () => void
  toast: (msg: string) => void
  clones: Clone[]
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
export const AdminPanelComplete: React.FC<AdminPanelCompleteProps> = ({ back, toast, clones }) => {
  const [tab, setTab] = useState<Tab>('overview')
  const [selectedClone, setSelectedClone] = useState<string>(clones[0]?.id || '')
  const [instances, setInstances] = useState<Instance[]>([])
  const [configs, setConfigs] = useState<InstanceConfig[]>([])
  const [newCfg, setNewCfg] = useState({ key: '', value: '' })
  const [savingCfg, setSavingCfg] = useState(false)
  const [newInst, setNewInst] = useState({ nombre: '', pais: '' })
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const INSTANCE_ID = 'master'

  useEffect(() => {
    const saved = localStorage.getItem('jz_instances')
    if (saved) {
      try { setInstances(JSON.parse(saved)) } catch {}
    } else {
      const def: Instance[] = [
        { id:'master', nombre:'MATRIZ CENTRAL', pais:'España', clones:clones.length, estado:'ONLINE', ultimaSync:new Date().toISOString(), ingresos:clones.reduce((s, c) => s + (c.ingresos || 0), 0) },
        { id:'lima', nombre:'FILIAL LIMA', pais:'Perú', clones:2, estado:'ONLINE', ultimaSync:new Date(Date.now()-1800000).toISOString(), ingresos:2100 },
        { id:'bsas', nombre:'OFICINA BUENOS AIRES', pais:'Argentina', clones:1, estado:'OFFLINE', ultimaSync:new Date(Date.now()-86400000).toISOString(), ingresos:0 },
      ]
      setInstances(def)
      localStorage.setItem('jz_instances', JSON.stringify(def))
    }
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    const { data } = await supabase.from('instance_configs').select('*').eq('instance_id', INSTANCE_ID)
    if (data) setConfigs(data)
  }

  const saveConfig = async () => {
    if (!newCfg.key || !newCfg.value) { toast('Completa los campos'); return }
    setSavingCfg(true)
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instance_id: INSTANCE_ID, config_key: newCfg.key, config_value: newCfg.value })
    })
    if (res.ok) { setNewCfg({ key:'', value:'' }); toast('Configuración guardada'); loadConfigs() }
    else toast('Error al guardar')
    setSavingCfg(false)
  }

  const deleteConfig = async (id: string) => {
    await supabase.from('instance_configs').delete().eq('id', id)
    setConfigs(prev => prev.filter(c => c.id !== id))
    toast('Configuración eliminada')
  }

  const broadcastToAll = async () => {
    if (!broadcastMsg.trim()) { toast('Escribe un mensaje'); return }
    setBroadcasting(true)
    let ok = 0
    for (const clone of clones) {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_clone_id: 'admin',
          to_clone_id: clone.id,
          from_instance_id: INSTANCE_ID,
          to_instance_id: INSTANCE_ID,
          subject: 'Comunicado de Administración',
          body: broadcastMsg,
        })
      })
      if (res.ok) ok++
    }
    toast(`Mensaje enviado a ${ok}/${clones.length} clones`)
    setBroadcastMsg('')
    setBroadcasting(false)
  }

  const addInstance = () => {
    if (!newInst.nombre || !newInst.pais) { toast('Completa los datos'); return }
    const inst: Instance = {
      id: uid(), nombre: newInst.nombre.toUpperCase(), pais: newInst.pais,
      clones: 0, estado: 'ONLINE', ultimaSync: new Date().toISOString(), ingresos: 0
    }
    const updated = [...instances, inst]
    setInstances(updated)
    localStorage.setItem('jz_instances', JSON.stringify(updated))
    setNewInst({ nombre:'', pais:'' })
    toast('Instancia añadida')
  }

  const deleteInstance = (id: string) => {
    if (id === 'master') { toast('No se puede eliminar la matriz'); return }
    const updated = instances.filter(i => i.id !== id)
    setInstances(updated)
    localStorage.setItem('jz_instances', JSON.stringify(updated))
    toast('Instancia eliminada')
  }

  const syncInstance = async (inst: Instance) => {
    await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_clone_id:'admin', to_clone_id:`inst_${inst.id}`, from_instance_id:INSTANCE_ID, to_instance_id:inst.id, subject:'Sincronización', body:'Sync solicitado desde matriz' })
    })
    const updated = instances.map(i => i.id === inst.id ? { ...i, ultimaSync: new Date().toISOString() } : i)
    setInstances(updated)
    localStorage.setItem('jz_instances', JSON.stringify(updated))
    toast(`${inst.nombre} sincronizado`)
  }

  const currentClone = clones.find(c => c.id === selectedClone) || clones[0]

  // PANELS QUE USAN SUB-COMPONENTES
  if (tab === 'messaging' && currentClone) {
    return (
      <MessagingPanel
        cloneId={currentClone.id}
        cloneName={currentClone.name}
        instanceId={INSTANCE_ID}
        clones={clones}
        back={() => setTab('overview')}
        toast={toast}
      />
    )
  }
  if (tab === 'reports' && currentClone) {
    return (
      <ReportsPanel
        cloneId={currentClone.id}
        cloneName={currentClone.name}
        instanceId={INSTANCE_ID}
        back={() => setTab('overview')}
        toast={toast}
      />
    )
  }
  if (tab === 'updates') {
    return (
      <UpdatesPanel
        instanceId={INSTANCE_ID}
        clones={clones}
        back={() => setTab('overview')}
        toast={toast}
      />
    )
  }

  // TOTALES
  const totalIngresos = instances.reduce((s, i) => s + i.ingresos, 0)
  const onlineInstances = instances.filter(i => i.estado === 'ONLINE').length
  const totalClones = clones.length

  const TABS: { key: Tab; label: string }[] = [
    { key:'overview', label:'RESUMEN' },
    { key:'messaging', label:'MENSAJES' },
    { key:'reports', label:'REPORTES' },
    { key:'updates', label:'UPDATES' },
    { key:'config-local', label:'MI CONFIG' },
    { key:'config-filiales', label:'FILIALES' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:T.bg, fontFamily:"'Rajdhani',sans-serif" }}>
      {/* HEADER */}
      <div style={{ padding:'12px 16px 0', background:T.bgCard, borderBottom:`1px solid ${T.border}44`, paddingTop:'calc(env(safe-area-inset-top,0px) + 12px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:`1.5px solid ${T.neon}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, position:'relative' }}>
              ⚙️
              <div style={{ position:'absolute', bottom:-2, right:-2, width:14, height:14, borderRadius:'50%', background:T.bgCard, border:`1px solid ${T.neon}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, fontWeight:900, color:T.neonBright, fontFamily:"'Orbitron',sans-serif" }}>
                {APP_VERSION.split('.')[0]}
              </div>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:T.white, fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.12em' }}>ADMINISTRACIÓN</div>
              <div style={{ fontSize:10, color:T.gray, marginTop:1 }}>v{APP_VERSION} · Control multinacional</div>
            </div>
          </div>
          <button onClick={back} style={{ background:'none', border:`1px solid ${T.border}44`, borderRadius:8, padding:'6px 12px', color:T.neon, fontSize:11, fontWeight:700, cursor:'pointer', letterSpacing:'0.08em' }}>
            ← VOLVER
          </button>
        </div>
        {/* TABS */}
        <div style={{ display:'flex', gap:4, overflowX:'auto', paddingBottom:0, scrollbarWidth:'none' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:'7px 10px', borderRadius:'8px 8px 0 0', whiteSpace:'nowrap',
              background: tab === t.key ? T.bg : 'transparent',
              border:`1px solid ${tab === t.key ? T.neon+'66' : T.border+'33'}`,
              borderBottom: tab === t.key ? `1px solid ${T.bg}` : `1px solid ${T.border}33`,
              color: tab === t.key ? T.neon : T.gray,
              fontSize:10, fontWeight:700, cursor:'pointer', letterSpacing:'0.08em',
              transition:'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10 }}>

        {/* ── OVERVIEW ───────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            {/* STATS GLOBALES */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'INSTANCIAS', value:`${onlineInstances}/${instances.length}`, color:T.green },
                { label:'CLONES', value:totalClones, color:T.neon },
                { label:'INGRESOS', value:`€${totalIngresos}`, color:T.yellow },
                { label:'VERSION', value:`v${APP_VERSION}`, color:T.electric },
              ].map(s => (
                <div key={s.label} style={{ background:T.bgCard, borderRadius:10, padding:'10px 12px', border:`1px solid ${s.color}33` }}>
                  <div style={{ fontSize:9, fontWeight:700, color:T.gray, letterSpacing:'0.1em', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:18, fontWeight:900, color:s.color, fontFamily:"'Orbitron',sans-serif", textShadow:`0 0 12px ${s.color}44` }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* SELECCIONAR CLON ACTIVO */}
            <div style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.border}44` }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.neon, letterSpacing:'0.1em', marginBottom:8 }}>CLON SELECCIONADO</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
                {clones.map(c => (
                  <button key={c.id} onClick={() => setSelectedClone(c.id)} style={{
                    padding:'8px 10px', borderRadius:8, cursor:'pointer', transition:'all 0.2s', textAlign:'left',
                    background: selectedClone === c.id ? `${T.neon}22` : T.dark,
                    border:`1px solid ${selectedClone === c.id ? T.neon : T.border}44`,
                  }}>
                    <div style={{ fontSize:11, fontWeight:700, color: selectedClone === c.id ? T.neon : T.white, letterSpacing:'0.06em' }}>{c.name}</div>
                    <div style={{ fontSize:9, color: c.estado === 'ACTIVO' ? T.green : T.red, marginTop:2 }}>● {c.estado}</div>
                  </button>
                ))}
              </div>

              {/* ACCESOS RAPIDOS PARA CLON SELECCIONADO */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                {[
                  { label:'MENSAJE', action: () => setTab('messaging'), color:T.neon },
                  { label:'REPORTE', action: () => setTab('reports'), color:T.electric },
                  { label:'UPDATE', action: () => setTab('updates'), color:T.green },
                ].map(a => (
                  <button key={a.label} onClick={a.action} style={{
                    padding:'10px 0', borderRadius:8,
                    background:`${a.color}11`, border:`1.5px solid ${a.color}44`,
                    color:a.color, fontSize:10, fontWeight:700, cursor:'pointer', letterSpacing:'0.1em',
                  }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BROADCAST */}
            <div style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.orange}44` }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.orange, letterSpacing:'0.1em', marginBottom:8 }}>BROADCAST A TODOS LOS CLONES</div>
              <textarea
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="Mensaje para todos los clones..."
                style={{ ...inp, minHeight:70, resize:'none', marginBottom:8 }}
              />
              <button onClick={broadcastToAll} disabled={broadcasting} style={{
                width:'100%', padding:'11px 0', borderRadius:8,
                background:`${T.orange}22`, border:`1.5px solid ${T.orange}66`,
                color:T.orange, fontSize:11, fontWeight:700,
                cursor:broadcasting ? 'not-allowed' : 'pointer', letterSpacing:'0.12em',
                fontFamily:"'Orbitron',sans-serif", opacity:broadcasting ? 0.5 : 1, transition:'all 0.2s',
              }}>
                {broadcasting ? 'ENVIANDO...' : 'ENVIAR A TODOS'}
              </button>
            </div>
          </>
        )}

        {/* ── CONFIG LOCAL ─────────────────────────────────── */}
        {tab === 'config-local' && (
          <>
            <div style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.border}44` }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.neon, letterSpacing:'0.1em', marginBottom:10 }}>NUEVA CONFIGURACIÓN</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input style={inp} placeholder="Clave (ej: moneda_base)" value={newCfg.key} onChange={e => setNewCfg({ ...newCfg, key: e.target.value })} />
                <input style={inp} placeholder="Valor (ej: EUR)" value={newCfg.value} onChange={e => setNewCfg({ ...newCfg, value: e.target.value })} />
                <button onClick={saveConfig} disabled={savingCfg} style={{
                  padding:'11px 0', borderRadius:8,
                  background:`${T.neon}22`, border:`1.5px solid ${T.neon}66`,
                  color:T.neonBright, fontSize:11, fontWeight:700,
                  cursor:savingCfg ? 'not-allowed' : 'pointer', letterSpacing:'0.12em',
                  fontFamily:"'Orbitron',sans-serif", opacity:savingCfg ? 0.5 : 1, transition:'all 0.2s',
                }}>
                  {savingCfg ? 'GUARDANDO...' : 'GUARDAR CONFIG'}
                </button>
              </div>
            </div>

            <div style={{ fontSize:11, fontWeight:700, color:T.gray, letterSpacing:'0.1em' }}>CONFIGURACIONES ACTUALES</div>
            {configs.length === 0
              ? <div style={{ color:T.gray, textAlign:'center', padding:16, fontSize:12, background:T.bgCard, borderRadius:10 }}>Sin configuraciones guardadas</div>
              : configs.map(cfg => (
                <div key={cfg.id} style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.border}44`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:T.neon }}>{cfg.config_key}</div>
                    <div style={{ fontSize:12, color:T.white, marginTop:2 }}>{cfg.config_value}</div>
                    <div style={{ fontSize:10, color:T.gray, marginTop:2 }}>{new Date(cfg.updated_at).toLocaleString('es-ES')}</div>
                  </div>
                  <button onClick={() => deleteConfig(cfg.id)} style={{ background:'none', border:`1px solid ${T.red}44`, borderRadius:6, padding:'6px 10px', color:T.red, fontSize:10, fontWeight:700, cursor:'pointer' }}>
                    ✕
                  </button>
                </div>
              ))
            }
          </>
        )}

        {/* ── CONFIG FILIALES ──────────────────────────────── */}
        {tab === 'config-filiales' && (
          <>
            {instances.map(inst => (
              <div key={inst.id} style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${inst.estado === 'ONLINE' ? T.neon+'33' : T.red+'33'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:T.white, fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.08em' }}>{inst.nombre}</div>
                    <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>📍 {inst.pais} · {inst.clones} clones · €{inst.ingresos}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, color:inst.estado==='ONLINE' ? T.green : T.red }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:inst.estado==='ONLINE' ? T.green : T.red, boxShadow:`0 0 6px ${inst.estado==='ONLINE' ? T.green : T.red}` }} />
                      {inst.estado}
                    </span>
                    {inst.id !== 'master' && (
                      <button onClick={() => deleteInstance(inst.id)} style={{ background:'none', border:`1px solid ${T.red}44`, borderRadius:6, padding:'4px 8px', color:T.red, fontSize:10, cursor:'pointer' }}>✕</button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize:10, color:T.gray, marginBottom:8 }}>
                  Última sync: {new Date(inst.ultimaSync).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => syncInstance(inst)} style={{ flex:1, padding:'8px 0', borderRadius:8, background:`${T.neon}11`, border:`1px solid ${T.neon}44`, color:T.neon, fontSize:10, fontWeight:700, cursor:'pointer', letterSpacing:'0.08em' }}>
                    SINCRONIZAR
                  </button>
                  <button onClick={() => toast(`Deploy enviado a ${inst.nombre}`)} style={{ flex:1, padding:'8px 0', borderRadius:8, background:`${T.green}11`, border:`1px solid ${T.green}44`, color:T.green, fontSize:10, fontWeight:700, cursor:'pointer', letterSpacing:'0.08em' }}>
                    ACTUALIZAR
                  </button>
                </div>
              </div>
            ))}

            {/* AÑADIR INSTANCIA */}
            <div style={{ background:T.bgCard, borderRadius:10, padding:12, border:`1px solid ${T.electric}44` }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.electric, letterSpacing:'0.1em', marginBottom:8 }}>CONECTAR NUEVA INSTANCIA</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input style={inp} placeholder="Nombre (ej: FILIAL MEXICO)" value={newInst.nombre} onChange={e => setNewInst({ ...newInst, nombre: e.target.value })} />
                <input style={inp} placeholder="País" value={newInst.pais} onChange={e => setNewInst({ ...newInst, pais: e.target.value })} />
                <button onClick={addInstance} style={{
                  padding:'11px 0', borderRadius:8,
                  background:`${T.electric}22`, border:`1.5px solid ${T.electric}66`,
                  color:T.electric, fontSize:11, fontWeight:700, cursor:'pointer',
                  letterSpacing:'0.12em', fontFamily:"'Orbitron',sans-serif",
                }}>
                  CONECTAR INSTANCIA
                </button>
              </div>
            </div>
          </>
        )}

        <div style={{ height:20 }} />
      </div>
    </div>
  )
}
