'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { signOut } from '@/lib/services/auth';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
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
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '20px' }}>CENTRAL v2.0</h1>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000410 0%, #0a0a15 100%)',
      fontFamily: 'Orbitron, sans-serif',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(180, 200, 220, 0.2)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>CENTRAL v2.0</h1>
        <button
          onClick={handleSignOut}
          style={{
            padding: '10px 20px',
            background: '#dc5050',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#b4c8dc', marginTop: 0 }}>Bienvenido, {user?.user_metadata?.first_name || 'Usuario'}</h2>
          <p style={{ color: '#7a8a9a' }}>Email: {user?.email}</p>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <Link href="/dashboard/clients" style={{
            padding: '30px',
            background: 'rgba(20, 20, 35, 0.8)',
            border: '2px solid rgba(100, 140, 180, 0.3)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#b4c8dc',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.3)'}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>Clientes</div>
          </Link>

          <Link href="/dashboard/apps" style={{
            padding: '30px',
            background: 'rgba(20, 20, 35, 0.8)',
            border: '2px solid rgba(100, 140, 180, 0.3)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#b4c8dc',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.3)'}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚙️</div>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>Aplicaciones</div>
          </Link>

          <Link href="/dashboard/audio" style={{
            padding: '30px',
            background: 'rgba(20, 20, 35, 0.8)',
            border: '2px solid rgba(100, 140, 180, 0.3)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#b4c8dc',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.3)'}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔊</div>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>Sistema de Sonidos</div>
          </Link>

          <Link href="/dashboard/admin" style={{
            padding: '30px',
            background: 'rgba(20, 20, 35, 0.8)',
            border: '2px solid rgba(100, 140, 180, 0.3)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#b4c8dc',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.8)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.3)'}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚡</div>
            <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>Admin</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
