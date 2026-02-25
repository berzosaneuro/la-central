'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createApp } from '@/lib/services/apps';
import Link from 'next/link';

export default function NewAppPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: null as string | null,
    status: 'active' as const,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createApp(formData);
      router.push('/dashboard/apps');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear aplicación');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000410 0%, #0a0a15 100%)',
      fontFamily: 'Orbitron, sans-serif',
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <Link href="/dashboard/apps" style={{
            color: '#b4c8dc',
            textDecoration: 'none',
            fontSize: '12px',
            marginBottom: '10px',
            display: 'inline-block'
          }}>
            ← Volver a Aplicaciones
          </Link>
          <h1 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>NUEVA APLICACIÓN</h1>
          <p style={{ color: '#7a8a9a', fontSize: '13px', marginTop: '10px' }}>La versión se incrementará automáticamente: 1.0.0 → 1.0.1</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(220, 80, 80, 0.15)',
            border: '1px solid #dc5050',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: '#ff9999',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(20, 20, 35, 0.8)',
          border: '2px solid rgba(100, 140, 180, 0.2)',
          borderRadius: '12px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Nombre de Aplicación *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: CRM CENTRAL"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(180, 200, 220, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción de la aplicación"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(180, 200, 220, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(180, 200, 220, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            >
              <option value="active" style={{ background: '#1a1a2e', color: '#fff' }}>Activo</option>
              <option value="archived" style={{ background: '#1a1a2e', color: '#fff' }}>Archivado</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: loading ? 'rgba(100, 180, 140, 0.3)' : 'linear-gradient(135deg, #64b48c 0%, #4a8a6c 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'CREANDO...' : 'CREAR APLICACIÓN'}
            </button>
            <Link href="/dashboard/apps" style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(100, 140, 180, 0.2)',
              border: '1px solid rgba(100, 140, 180, 0.3)',
              borderRadius: '6px',
              color: '#b4c8dc',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 140, 180, 0.4)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(100, 140, 180, 0.2)'}>
              CANCELAR
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
