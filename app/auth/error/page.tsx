'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
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
        border: '2px solid rgba(220, 100, 100, 0.3)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 0 40px rgba(220, 100, 100, 0.15)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          color: '#ff9999',
          margin: '0 0 20px 0',
          letterSpacing: '0.08em'
        }}>ERROR</h1>
        <p style={{
          color: '#7a8a9a',
          fontSize: '14px',
          marginBottom: '20px',
          lineHeight: 1.6
        }}>
          Hubo un error durante la autenticación. Por favor intenta de nuevo.
        </p>
        <Link href="/auth/login" style={{
          display: 'inline-block',
          padding: '12px 30px',
          background: 'linear-gradient(135deg, #6488b4 0%, #4a6a8a 100%)',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '0.08em'
        }}>
          Volver al Login
        </Link>
      </div>
    </div>
  );
}
