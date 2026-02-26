'use client'

import React, { useState, useEffect } from 'react'
import { supabase, InstanceConfig, CloneUpdate } from '@/lib/supabase'
import { MessagingPanel } from './messaging-panel'
import { ReportsPanel } from './reports-panel'
import { UpdatesPanel } from './updates-panel'

interface Clone {
  id: string
  name: string
  status: string
  lastSync: string
}

interface Instance {
  id: string
  nombre: string
  pais: string
  clones: number
  estado: string
}

interface AdminPanelCompleteProps {
  back: () => void
  toast: (msg: string) => void
}

type AdminTab = 'overview' | 'config-local' | 'config-filiales' | 'messaging' | 'reports' | 'updates'

export const AdminPanelComplete: React.FC<AdminPanelCompleteProps> = ({ back, toast }) => {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [instances, setInstances] = useState<Instance[]>([])
  const [configs, setConfigs] = useState<Record<string, InstanceConfig[]>>({})
  const [selectedInstance, setSelectedInstance] = useState<string>('master')
  const [selectedClone, setSelectedClone] = useState<string>('')
  const [newConfig, setNewConfig] = useState({ key: '', value: '' })
  const [localClones, setLocalClones] = useState<Clone[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Cargar instancias
    const savedInstances = localStorage.getItem('instances')
    if (savedInstances) {
      setInstances(JSON.parse(savedInstances))
    }

    // Cargar configuraciones
    for (const inst of instances) {
      const { data } = await supabase
        .from('instance_configs')
        .select('*')
        .eq('instance_id', inst.id)
      if (data) setConfigs(prev => ({ ...prev, [inst.id]: data }))
    }

    // Cargar clones locales
    const savedClones = localStorage.getItem('clones')
    if (savedClones) {
      setLocalClones(JSON.parse(savedClones))
    }
  }

  const saveConfig = async () => {
    if (!newConfig.key || !newConfig.value) {
      toast('Completa los campos')
      return
    }

    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instance_id: selectedInstance,
        config_key: newConfig.key,
        config_value: newConfig.value
      })
    })

    if (res.ok) {
      toast('Configuración guardada')
      setNewConfig({ key: '', value: '' })
      loadData()
    }
  }

  const broadcastToClones = async (message: string) => {
    for (const clone of localClones) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_clone_id: 'admin',
          to_clone_id: clone.id,
          from_instance_id: selectedInstance,
          to_instance_id: selectedInstance,
          subject: 'Actualización de administración',
          body: message
        })
      })
    }
    toast('Mensaje enviado a todos los clones')
  }

  const deployToAllClones = async () => {
    for (const clone of localClones) {
      await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clone_id: clone.id,
          instance_id: selectedInstance,
          version: 'v1.2.3'
        })
      })
    }
    toast('Despliegue iniciado en todos los clones')
  }

  // Panel de mensajería
  if (tab === 'messaging' && selectedClone) {
    return (
      <MessagingPanel
        cloneId={selectedClone}
        cloneName={localClones.find(c => c.id === selectedClone)?.name || 'Clone'}
        instanceId={selectedInstance}
        back={() => setTab('overview')}
        toast={toast}
      />
    )
  }

  // Panel de reportes
  if (tab === 'reports' && selectedClone) {
    return (
      <ReportsPanel
        cloneId={selectedClone}
        cloneName={localClones.find(c => c.id === selectedClone)?.name || 'Clone'}
        instanceId={selectedInstance}
        back={() => setTab('overview')}
        toast={toast}
      />
    )
  }

  // Panel de actualizaciones
  if (tab === 'updates') {
    return (
      <UpdatesPanel
        instanceId={selectedInstance}
        back={() => setTab('overview')}
        toast={toast}
      />
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a1e3e', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: '#051630', borderBottom: '1px solid #00d4ff44', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#00d4ff', margin: 0, fontSize: '16px', fontWeight: 700 }}>⚙️ ADMINISTRACIÓN COMPLETA</h1>
        <button onClick={back} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '14px' }}>✕ Cerrar</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', background: '#0a3050', borderBottom: '1px solid #00d4ff22', overflowX: 'auto' }}>
        {(['overview', 'config-local', 'config-filiales', 'messaging', 'reports', 'updates'] as AdminTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 12px',
              background: tab === t ? '#00d4ff' : 'transparent',
              color: tab === t ? '#051630' : '#00d4ff',
              border: `1px solid ${tab === t ? '#00d4ff' : '#00d4ff44'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {t === 'overview' && '📊 Resumen'}
            {t === 'config-local' && '⚙️ Mi Config'}
            {t === 'config-filiales' && '🌐 Filiales'}
            {t === 'messaging' && '💬 Mensajes'}
            {t === 'reports' && '📈 Reportes'}
            {t === 'updates' && '🚀 Updates'}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
              <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Instancia Actual</div>
              <select
                value={selectedInstance}
                onChange={e => setSelectedInstance(e.target.value)}
                style={{ width: '100%', padding: '8px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
              >
                {instances.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre} ({inst.pais})
                  </option>
                ))}
              </select>
            </div>

            {/* Clones locales */}
            <div style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
              <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Clones en esta instancia</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                {localClones.map(clone => (
                  <div
                    key={clone.id}
                    onClick={() => setSelectedClone(clone.id)}
                    style={{
                      padding: '8px',
                      background: selectedClone === clone.id ? '#00d4ff22' : '#051630',
                      border: `1px solid ${selectedClone === clone.id ? '#00d4ff' : '#00d4ff22'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{clone.name}</span>
                    <span style={{ color: clone.status === 'ACTIVE' ? '#00ff00' : '#ff0000', fontSize: '10px' }}>● {clone.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones globales */}
            <div style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
              <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Acciones Globales</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => broadcastToClones('Sincronización iniciada')}
                  style={{ padding: '8px', background: '#00d4ff22', border: '1px solid #00d4ff', color: '#00d4ff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  🔄 Sincronizar Todos
                </button>
                <button
                  onClick={deployToAllClones}
                  style={{ padding: '8px', background: '#00ff0022', border: '1px solid #00ff00', color: '#00ff00', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  🚀 Deploy a Todos
                </button>
              </div>
            </div>
          </>
        )}

        {/* CONFIG LOCAL */}
        {tab === 'config-local' && (
          <div style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
            <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Configuración de {instances.find(i => i.id === selectedInstance)?.nombre}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <input
                placeholder="Clave"
                value={newConfig.key}
                onChange={e => setNewConfig({ ...newConfig, key: e.target.value })}
                style={{ padding: '8px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
              />
              <input
                placeholder="Valor"
                value={newConfig.value}
                onChange={e => setNewConfig({ ...newConfig, value: e.target.value })}
                style={{ padding: '8px', background: '#051630', border: '1px solid #00d4ff33', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
              />
              <button
                onClick={saveConfig}
                style={{ padding: '8px', background: '#00d4ff', border: 'none', color: '#051630', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                💾 Guardar Configuración
              </button>
            </div>

            <div style={{ borderTop: '1px solid #00d4ff22', paddingTop: '12px' }}>
              {configs[selectedInstance]?.map(cfg => (
                <div key={cfg.id} style={{ padding: '6px', background: '#051630', marginBottom: '6px', borderRadius: '3px', fontSize: '11px' }}>
                  <strong style={{ color: '#00d4ff' }}>{cfg.config_key}:</strong> <span style={{ color: '#aaa' }}>{cfg.config_value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIG FILIALES */}
        {tab === 'config-filiales' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {instances.map(inst => (
              <div key={inst.id} style={{ background: '#0a3050', padding: '12px', borderRadius: '8px', border: '1px solid #00d4ff44' }}>
                <div style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  {inst.nombre} ({inst.pais})
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                  Estado: <span style={{ color: inst.estado === 'ONLINE' ? '#00ff00' : '#ff0000' }}>{inst.estado}</span> • Clones: {inst.clones}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => toast(`Sincronizando ${inst.nombre}`)}
                    style={{ flex: 1, padding: '6px', background: '#00d4ff22', border: '1px solid #00d4ff', color: '#00d4ff', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                  >
                    🔄 Sincronizar
                  </button>
                  <button
                    onClick={() => toast(`Actualizando ${inst.nombre}`)}
                    style={{ flex: 1, padding: '6px', background: '#00ff0022', border: '1px solid #00ff00', color: '#00ff00', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                  >
                    ⬆️ Actualizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
