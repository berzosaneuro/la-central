'use client'

import React, { useState, useEffect } from 'react'
import { CloneUpdate, supabase, subscribeToUpdates } from '@/lib/supabase'

interface UpdatesPanelProps {
  instanceId: string
  back: () => void
  toast: (msg: string) => void
}

export const UpdatesPanel: React.FC<UpdatesPanelProps> = ({ instanceId, back, toast }) => {
  const [updates, setUpdates] = useState<CloneUpdate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUpdates()
  }, [instanceId])

  const fetchUpdates = async () => {
    const { data } = await supabase
      .from('clone_updates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUpdates(data)
  }

  const deployVersion = async (version: string) => {
    setLoading(true)
    const res = await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clone_id: 'all',
        instance_id: instanceId,
        version
      })
    })

    if (res.ok) {
      toast('Despliegue iniciado')
      fetchUpdates()
    } else {
      toast('Error en el despliegue')
    }
    setLoading(false)
  }

  const updateProgress = async (id: string, progress: number) => {
    const status = progress === 100 ? 'complete' : progress > 0 ? 'installing' : 'downloading'
    await fetch('/api/updates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, progress })
    })
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', background: '#0a1e3e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 700 }}>Actualizaciones de Clones</h2>
        <button onClick={back} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '14px' }}>← Volver</button>
      </div>

      {/* Desplegar nueva versión */}
      <div style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
        <label style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Desplegar Nueva Versión</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="v1.2.3"
            onKeyPress={e => {
              if (e.key === 'Enter') deployVersion((e.target as HTMLInputElement).value)
            }}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', fontSize: '12px' }}
          />
          <button
            onClick={() => deployVersion('v1.2.3')}
            disabled={loading}
            style={{ padding: '8px 16px', background: loading ? '#666' : '#00d4ff', color: '#051630', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px' }}
          >
            {loading ? 'Desplegando...' : '🚀 Deploy'}
          </button>
        </div>
      </div>

      {/* Historial de actualizaciones */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', background: '#051630', borderRadius: '8px', border: '1px solid #00d4ff33' }}>
        {updates.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Sin actualizaciones</div>
        ) : (
          updates.map(upd => (
            <div key={upd.id} style={{ padding: '12px', marginBottom: '8px', background: '#0a3050', borderRadius: '4px', border: `1px solid ${upd.status === 'complete' ? '#00ff00' : upd.status === 'error' ? '#ff0000' : '#00d4ff'}22` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: '12px' }}>Versión {upd.version}</div>
                  <div style={{ color: '#aaa', fontSize: '11px' }}>Clone: {upd.clone_id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: upd.status === 'complete' ? '#00ff00' : upd.status === 'error' ? '#ff0000' : '#ffaa00', fontWeight: 600, fontSize: '11px' }}>
                    {upd.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: '#051630', borderRadius: '3px', height: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${upd.progress}%`,
                    background: upd.status === 'error' ? '#ff0000' : '#00ff00',
                    transition: 'width 0.3s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#aaa' }}>
                <span>{upd.progress}%</span>
                <span>{new Date(upd.created_at).toLocaleTimeString()}</span>
              </div>

              {upd.error_message && (
                <div style={{ color: '#ff6b6b', fontSize: '10px', marginTop: '6px' }}>Error: {upd.error_message}</div>
              )}

              {upd.status !== 'complete' && upd.status !== 'error' && (
                <button
                  onClick={() => updateProgress(upd.id, Math.min(upd.progress + 25, 100))}
                  style={{ width: '100%', marginTop: '8px', padding: '6px', background: '#00d4ff22', border: '1px solid #00d4ff', color: '#00d4ff', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                >
                  Simular progreso
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
