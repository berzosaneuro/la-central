'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getApps, deleteApp } from '@/lib/services/apps';
import type { App } from '@/lib/services/apps';
import Link from 'next/link';

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadApps = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const appsList = await getApps();
        setApps(appsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar aplicaciones');
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta aplicación?')) {
      try {
        await deleteApp(id);
        setApps(apps.filter(a => a.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar aplicación');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000410 0%, #0a0a15 100%)',
      fontFamily: 'Orbitron, sans-serif',
      color: '#fff',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Link href="/dashboard" style={{
            color: '#b4c8dc',
            textDecoration: 'none',
            fontSize: '12px',
            marginBottom: '10px',
            display: 'inline-block'
          }}>
            ← Volver al Dashboard
          </Link>
          <h1 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>APLICACIONES</h1>
        </div>
        <Link href="/dashboard/apps/new" style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #64b48c 0%, #4a8a6c 100%)',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '12px'
        }}>
          + Nueva Aplicación
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 20px',
          background: 'rgba(220, 80, 80, 0.15)',
          border: '1px solid #dc5050',
          borderRadius: '6px',
          padding: '12px',
          color: '#ff9999'
        }}>
          {error}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#7a8a9a'
          }}>
            Cargando aplicaciones...
          </div>
        ) : apps.length === 0 ? (
          <div style={{
            background: 'rgba(20, 20, 35, 0.8)',
            border: '2px solid rgba(100, 140, 180, 0.2)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: '#7a8a9a'
          }}>
            <p>No hay aplicaciones registradas</p>
            <Link href="/dashboard/apps/new" style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #64b48c 0%, #4a8a6c 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 700
            }}>
              Crear primera aplicación
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {apps.map(app => (
              <div key={app.id} style={{
                background: 'rgba(20, 20, 35, 0.8)',
                border: '2px solid rgba(100, 140, 180, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.3s'
              }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.6)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.2)'}>
                <h3 style={{ margin: '0 0 10px 0', color: '#b4c8dc' }}>{app.name}</h3>
                {app.description && <p style={{ color: '#7a8a9a', fontSize: '13px', margin: '5px 0' }}>{app.description}</p>}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '15px 0'
                }}>
                  <span style={{
                    color: '#64acd4',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>v{app.version}</span>
                  <span style={{
                    color: app.status === 'active' ? '#64b48c' : '#dc9050',
                    fontSize: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {app.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link href={`/dashboard/apps/${app.id}`} style={{
                    flex: 1,
                    padding: '8px',
                    background: 'rgba(100, 140, 180, 0.2)',
                    border: '1px solid rgba(100, 140, 180, 0.3)',
                    borderRadius: '4px',
                    color: '#b4c8dc',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 140, 180, 0.4)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(100, 140, 180, 0.2)'}>
                    Ver
                  </Link>
                  <button
                    onClick={() => handleDelete(app.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'rgba(220, 80, 80, 0.2)',
                      border: '1px solid rgba(220, 80, 80, 0.3)',
                      borderRadius: '4px',
                      color: '#ff9999',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220, 80, 80, 0.4)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220, 80, 80, 0.2)'}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
