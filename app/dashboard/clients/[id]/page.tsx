'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getClient, updateClient } from '@/lib/services/clients';
import type { Client } from '@/lib/services/clients';
import Link from 'next/link';

export default function ClientDetailPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const clientId = params.id as string;

  useEffect(() => {
    const loadClient = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const clientData = await getClient(clientId);
        setClient(clientData);
        setFormData(clientData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cliente');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updated = await updateClient(clientId, formData as any);
      setClient(updated);
      setEditing(false);
      setFormData(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000410 0%, #0a0a15 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        Cargando...
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000410 0%, #0a0a15 100%)',
        fontFamily: 'Orbitron, sans-serif',
        color: '#fff',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Link href="/dashboard/clients" style={{
            color: '#b4c8dc',
            textDecoration: 'none'
          }}>
            ← Volver
          </Link>
          <p style={{ color: '#ff9999', marginTop: '20px' }}>Cliente no encontrado</p>
        </div>
      </div>
    );
  }

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>CLIENTE</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(100, 140, 180, 0.3)',
                  border: '1px solid rgba(100, 140, 180, 0.5)',
                  borderRadius: '4px',
                  color: '#b4c8dc',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                Editar
              </button>
            )}
          </div>
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

        {/* Display/Edit Mode */}
        <div style={{
          background: 'rgba(20, 20, 35, 0.8)',
          border: '2px solid rgba(100, 140, 180, 0.2)',
          borderRadius: '12px',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {!editing ? (
            // Display Mode
            <>
              <div>
                <p style={{ color: '#7a8a9a', fontSize: '11px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Nombre</p>
                <p style={{ color: '#b4c8dc', fontSize: '16px', margin: 0 }}>{client.name}</p>
              </div>
              <div>
                <p style={{ color: '#7a8a9a', fontSize: '11px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Email</p>
                <p style={{ color: '#b4c8dc', fontSize: '16px', margin: 0 }}>{client.email}</p>
              </div>
              {client.phone && (
                <div>
                  <p style={{ color: '#7a8a9a', fontSize: '11px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Teléfono</p>
                  <p style={{ color: '#b4c8dc', fontSize: '16px', margin: 0 }}>{client.phone}</p>
                </div>
              )}
              {client.company && (
                <div>
                  <p style={{ color: '#7a8a9a', fontSize: '11px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Empresa</p>
                  <p style={{ color: '#b4c8dc', fontSize: '16px', margin: 0 }}>{client.company}</p>
                </div>
              )}
              <div>
                <p style={{ color: '#7a8a9a', fontSize: '11px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Estado</p>
                <p style={{
                  color: client.status === 'active' ? '#64b48c' : '#dc9050',
                  fontSize: '16px',
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  {client.status}
                </p>
              </div>
            </>
          ) : (
            // Edit Mode
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#b4c8dc',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(180, 200, 220, 0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#b4c8dc',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(180, 200, 220, 0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#b4c8dc',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(180, 200, 220, 0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#b4c8dc',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>Empresa</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(180, 200, 220, 0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: '#b4c8dc',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>Estado</label>
                <select
                  name="status"
                  value={formData.status || 'active'}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(180, 200, 220, 0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="active" style={{ background: '#1a1a2e' }}>Activo</option>
                  <option value="inactive" style={{ background: '#1a1a2e' }}>Inactivo</option>
                </select>
              </div>

              {/* Edit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: saving ? 'rgba(100, 180, 140, 0.3)' : 'linear-gradient(135deg, #64b48c 0%, #4a8a6c 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(client);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(100, 140, 180, 0.2)',
                    border: '1px solid rgba(100, 140, 180, 0.3)',
                    borderRadius: '4px',
                    color: '#b4c8dc',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
