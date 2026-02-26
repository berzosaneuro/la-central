'use client'

import React, { useState, useEffect } from 'react'
import { Message, supabase, subscribeToMessages } from '@/lib/supabase'

interface MessagingPanelProps {
  cloneId: string
  cloneName: string
  instanceId: string
  back: () => void
  toast: (msg: string) => void
}

export const MessagingPanel: React.FC<MessagingPanelProps> = ({ cloneId, cloneName, instanceId, back, toast }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState({ to_clone_id: '', subject: '', body: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('to_clone_id', cloneId)
        .order('created_at', { ascending: false })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    // Real-time subscription
    const subscription = subscribeToMessages(cloneId, (msg) => {
      setMessages(prev => [msg, ...prev])
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [cloneId])

  const sendMessage = async () => {
    if (!newMessage.to_clone_id || !newMessage.subject || !newMessage.body) {
      toast('Completa todos los campos')
      return
    }

    setLoading(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_clone_id: cloneId,
        to_clone_id: newMessage.to_clone_id,
        from_instance_id: instanceId,
        to_instance_id: instanceId,
        subject: newMessage.subject,
        body: newMessage.body
      })
    })

    if (res.ok) {
      setNewMessage({ to_clone_id: '', subject: '', body: '' })
      toast('Mensaje enviado')
    } else {
      toast('Error al enviar')
    }
    setLoading(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', background: '#0a1e3e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 700 }}>Mensajes para {cloneName}</h2>
        <button onClick={back} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '14px' }}>← Volver</button>
      </div>

      {/* Mensajes recibidos */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', background: '#051630', borderRadius: '8px', border: '1px solid #00d4ff33', marginBottom: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Sin mensajes</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ padding: '12px', marginBottom: '8px', background: '#0a3050', borderLeft: `3px solid ${msg.read ? '#00d4ff' : '#ff6b6b'}`, borderRadius: '4px' }}>
              <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: '12px' }}>{msg.subject}</div>
              <div style={{ color: '#aaa', fontSize: '12px', margin: '4px 0' }}>{msg.body}</div>
              <div style={{ color: '#666', fontSize: '10px' }}>De: {msg.from_clone_id}</div>
            </div>
          ))
        )}
      </div>

      {/* Enviar mensaje */}
      <div style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
        <input
          placeholder="Clon destino"
          value={newMessage.to_clone_id}
          onChange={e => setNewMessage({ ...newMessage, to_clone_id: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', fontSize: '12px' }}
        />
        <input
          placeholder="Asunto"
          value={newMessage.subject}
          onChange={e => setNewMessage({ ...newMessage, subject: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', fontSize: '12px' }}
        />
        <textarea
          placeholder="Mensaje"
          value={newMessage.body}
          onChange={e => setNewMessage({ ...newMessage, body: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', fontSize: '12px', minHeight: '60px', resize: 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: loading ? '#666' : '#00d4ff', color: '#051630', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px' }}
        >
          {loading ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </div>
    </div>
  )
}
