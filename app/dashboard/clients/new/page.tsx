'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/services/clients';
import Link from 'next/link';

export default function NewClientPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
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
      await createClient(formData);
      router.push('/dashboard/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <Link href="/dashboard/clients" style={{
            color: '#b4c8dc',
            textDecoration: 'none',
            fontSize: '12px',
            marginBottom: '10px',
            display: 'inline-block'
          }}>
            ← Volver a Clientes
          </Link>
          <h1 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>NUEVO CLIENTE</h1>
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
            }}>Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del cliente"
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

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@ejemplo.com"
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

          {/* Phone */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+34 600 000 000"
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

          {/* Company */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Empresa</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Nombre de la empresa"
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
              <option value="inactive" style={{ background: '#1a1a2e', color: '#fff' }}>Inactivo</option>
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
              {loading ? 'CREANDO...' : 'CREAR CLIENTE'}
            </button>
            <Link href="/dashboard/clients" style={{
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
