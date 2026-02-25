'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000410 0%, #0a0a15 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Orbitron, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(20, 20, 35, 0.9)',
        border: '2px solid rgba(180, 200, 220, 0.3)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 0 40px rgba(100, 140, 180, 0.15)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#D8DDE4',
            margin: 0,
            letterSpacing: '0.08em',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)'
          }}>CENTRAL</h1>
          <p style={{
            color: '#7a8a9a',
            fontSize: '12px',
            margin: '8px 0 0 0',
            letterSpacing: '0.04em'
          }}>v2.0 — Master Control</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(220, 80, 80, 0.15)',
            border: '1px solid #dc5050',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#ff9999'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.6)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(180, 200, 220, 0.2)'}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(100, 140, 180, 0.6)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(180, 200, 220, 0.2)'}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 20px',
              background: loading ? 'rgba(100, 140, 180, 0.3)' : 'linear-gradient(135deg, #6488b4 0%, #4a6a8a 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              transition: 'all 0.3s',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        {/* Signup Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '13px',
          color: '#7a8a9a'
        }}>
          ¿Sin cuenta?{' '}
          <Link href="/auth/signup" style={{
            color: '#b4c8dc',
            textDecoration: 'none',
            fontWeight: 700,
            transition: 'color 0.3s'
          }} onMouseEnter={(e) => e.currentTarget.style.color = '#64acd4'} onMouseLeave={(e) => e.currentTarget.style.color = '#b4c8dc'}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
