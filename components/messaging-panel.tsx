'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase, subscribeToMessages, Message } from '@/lib/supabase'

const T = {
  bg:"#000410",bgCard:"#0A1628",bgCardLight:"#0D1E35",
  border:"#1A5A8A",borderBright:"#2080C0",
  neon:"#00C8FF",neonBright:"#60E8FF",
  electric:"#3A9FFF",white:"#E0F4FF",gray:"#5A8AAA",
  dark:"#050C18",red:"#FF4466",green:"#00FF80",
  orange:"#FFA040",yellow:"#FFE040",
}

const inp: React.CSSProperties = {
  width:"100%",padding:"10px 12px",borderRadius:8,
  background:T.dark,border:`1px solid ${T.border}66`,
  color:T.white,fontSize:12,fontFamily:"'Rajdhani',sans-serif",
  letterSpacing:"0.06em",outline:"none",
}

interface MessagingPanelProps {
  cloneId: string
  cloneName: string
  instanceId: string
  clones: Array<{ id: string; name: string }>
  back: () => void
  toast: (msg: string) => void
}

export const MessagingPanel: React.FC<MessagingPanelProps> = ({
  cloneId, cloneName, instanceId, clones, back, toast
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [tab, setTab] = useState<'inbox' | 'send'>('inbox')
  const [form, setForm] = useState({ to: '', subject: '', body: '' })
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    const sub = subscribeToMessages(cloneId, (msg) => {
      setMessages(prev => [msg, ...prev])
    })
    return () => { sub.unsubscribe() }
  }, [cloneId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [messages])

  const fetchMessages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`to_clone_id.eq.${cloneId},from_clone_id.eq.${cloneId}`)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setMessages(data)
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!form.to || !form.subject || !form.body) {
      toast('Completa todos los campos')
      return
    }
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_clone_id: cloneId,
        to_clone_id: form.to,
        from_instance_id: instanceId,
        to_instance_id: instanceId,
        subject: form.subject,
        body: form.body,
      })
    })
    if (res.ok) {
      setForm({ to: '', subject: '', body: '' })
      toast(`Mensaje enviado a ${clones.find(c => c.id === form.to)?.name || form.to}`)
      fetchMessages()
      setTab('inbox')
    } else {
      toast('Error al enviar mensaje')
    }
    setSending(false)
  }

  const markRead = async (id: string) => {
    await supabase.from('messages').update({ read: true }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
  }

  const inbox = messages.filter(m => m.to_clone_id === cloneId)
  const sent  = messages.filter(m => m.from_clone_id === cloneId)
  const unread = inbox.filter(m => !m.read).length

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:T.bg }}>
      {/* HEADER */}
      <div style={{ padding:'14px 16px 10px', background:T.bgCard, borderBottom:`1px solid ${T.border}44` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:T.white, fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.1em' }}>
              MENSAJERIA
            </div>
            <div style={{ fontSize:11, color:T.gray, marginTop:2 }}>{cloneName} · {unread} sin leer</div>
          </div>
          <button onClick={back} style={{ background:'none', border:`1px solid ${T.border}44`, borderRadius:8, padding:'6px 12px', color:T.neon, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif" }}>
            ← VOLVER
          </button>
        </div>
        {/* TABS */}
        <div style={{ display:'flex', gap:6 }}>
          {(['inbox','send'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'7px 0', borderRadius:8,
              background: tab===t ? `${T.neon}22` : 'transparent',
              border:`1px solid ${tab===t ? T.neon : T.border}44`,
              color: tab===t ? T.neon : T.gray,
              fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif",
              letterSpacing:'0.1em',
            }}>
              {t === 'inbox' ? `BANDEJA${unread > 0 ? ` (${unread})` : ''}` : 'ENVIAR'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
        {tab === 'inbox' && (
          loading
            ? <div style={{ color:T.gray, textAlign:'center', padding:30, fontSize:12 }}>Cargando...</div>
            : inbox.length === 0
              ? <div style={{ color:T.gray, textAlign:'center', padding:30, fontSize:12 }}>Sin mensajes recibidos</div>
              : inbox.map(msg => (
                <div key={msg.id} onClick={() => !msg.read && markRead(msg.id)} style={{
                  padding:12, borderRadius:10,
                  background: msg.read ? T.bgCard : `${T.neon}11`,
                  border:`1px solid ${msg.read ? T.border+'44' : T.neon+'44'}`,
                  cursor: msg.read ? 'default' : 'pointer',
                  transition:'all 0.2s',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:4 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.white, fontFamily:"'Rajdhani',sans-serif" }}>{msg.subject}</div>
                    {!msg.read && <span style={{ fontSize:9, fontWeight:700, color:T.neon, background:`${T.neon}22`, padding:'2px 6px', borderRadius:10 }}>NUEVO</span>}
                  </div>
                  <div style={{ fontSize:12, color:T.gray, marginBottom:4, lineHeight:1.4 }}>{msg.body}</div>
                  <div style={{ fontSize:10, color:T.border }}>De: {msg.from_clone_id} · {new Date(msg.created_at).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</div>
                </div>
              ))
        )}

        {tab === 'send' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.gray, letterSpacing:'0.08em', marginBottom:2 }}>DESTINO</div>
            <select
              value={form.to}
              onChange={e => setForm({ ...form, to: e.target.value })}
              style={{ ...inp }}
            >
              <option value="">— Selecciona clon —</option>
              {clones.filter(c => c.id !== cloneId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="admin">ADMIN MATRIZ</option>
            </select>
            <div style={{ fontSize:11, fontWeight:700, color:T.gray, letterSpacing:'0.08em' }}>ASUNTO</div>
            <input
              style={inp}
              placeholder="Asunto del mensaje..."
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
            />
            <div style={{ fontSize:11, fontWeight:700, color:T.gray, letterSpacing:'0.08em' }}>MENSAJE</div>
            <textarea
              style={{ ...inp, minHeight:100, resize:'none', lineHeight:1.5 }}
              placeholder="Escribe tu mensaje aquí..."
              value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
            />
            <div style={{ height:1, background:`linear-gradient(90deg,${T.neon}44,transparent)`, margin:'4px 0' }} />
            <button
              onClick={sendMessage}
              disabled={sending}
              style={{
                padding:'12px 0', borderRadius:10,
                background: sending ? T.bgCard : `linear-gradient(90deg,${T.neon}22,${T.electric}22)`,
                border:`1.5px solid ${T.neon}66`,
                color: T.neonBright, fontSize:12, fontWeight:700,
                cursor: sending ? 'not-allowed' : 'pointer',
                fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.15em',
                textShadow:`0 0 12px ${T.neon}88`,
                boxShadow: sending ? 'none' : `0 0 16px ${T.neon}22`,
                transition:'all 0.2s', opacity: sending ? 0.5 : 1,
              }}
            >
              {sending ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
            </button>

            {/* SENT */}
            {sent.length > 0 && (
              <>
                <div style={{ fontSize:11, fontWeight:700, color:T.gray, letterSpacing:'0.08em', marginTop:8 }}>ENVIADOS RECIENTES</div>
                {sent.slice(0, 5).map(msg => (
                  <div key={msg.id} style={{ padding:10, borderRadius:8, background:T.bgCard, border:`1px solid ${T.border}33` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.white }}>{msg.subject}</div>
                    <div style={{ fontSize:10, color:T.gray, marginTop:2 }}>Para: {msg.to_clone_id} · {new Date(msg.created_at).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        <div style={{ height:20 }} />
      </div>
    </div>
  )
}
