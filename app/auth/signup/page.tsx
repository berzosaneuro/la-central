'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          border: '2px solid rgba(100, 180, 140, 0.3)',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(100, 180, 140, 0.15)'
        }}>
          <h2 style={{ color: '#64b48c', marginTop: 0 }}>¡Registro exitoso!</h2>
          <p style={{ color: '#7a8a9a' }}>Hemos enviado un enlace de confirmación a tu email. Verifica tu bandeja de entrada.</p>
          <Link href="/auth/login" style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 30px',
            background: 'linear-gradient(135deg, #6488b4 0%, #4a6a8a 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 700
          }}>
            Volver al login
          </Link>
        </div>
      </div>
    );
  }

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
          }}>v2.0 — Regístrate Ahora</p>
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
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Nombre</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Tu nombre"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(180, 200, 220, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
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
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(180, 200, 220, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
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
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(180, 200, 220, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#b4c8dc',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Confirmar</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(180, 200, 220, 0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Signup Button */}
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
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '13px',
          color: '#7a8a9a'
        }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" style={{
            color: '#b4c8dc',
            textDecoration: 'none',
            fontWeight: 700
          }}>
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
