'use client'

/**
 * app/login/page.tsx
 * ─────────────────────────────────────────────────────────────────
 * Pantalla de acceso a TITAN OS.
 * Diseño: fondo Bugatti full-screen + overlay oscuro + card glass.
 *
 * SEGURIDAD:
 *  - Si Supabase configurado → formulario real
 *  - Si NO configurado + NEXT_PUBLIC_DEMO_MODE=1 → acceso demo (preview only)
 *  - Si NO configurado + sin demo mode → bloqueo total con mensaje de error
 *  - Si hay sesión activa → proxy redirige antes de llegar aquí
 *  - En producción: NEXT_PUBLIC_DEMO_MODE nunca se establece
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseConfigured } from '@/lib/supabase'

// Set in preview/dev only. Never set in production.
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === '1'

export default function LoginPage() {
  const router = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  /* ── Real auth submit ────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!supabaseConfigured || !supabase) {
      setError('Sistema no configurado. Contacta con el administrador.')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    setLoading(false)

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Confirma tu email antes de acceder.')
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.')
      }
      return
    }

    router.replace('/inicio')
  }

  /* ── Demo mode entry (preview only) ─────────────────────────── */
  const handleDemo = () => {
    // Cookie read by proxy.ts — only honored when DEMO_MODE=1 is set
    // server-side. In production the cookie is ignored unconditionally.
    document.cookie = 'titan-demo=1; path=/; max-age=28800; SameSite=Lax'
    router.replace('/inicio')
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={styles.root}>

      <div style={styles.bg} />
      <div style={styles.overlay} />
      <div style={styles.scanline} />

      <div style={styles.card}>

        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>⬡</div>
          <div style={styles.logoTitle}>TITAN OS</div>
          <div style={styles.logoSub}>SISTEMA DE ÉLITE · v3.0</div>
        </div>

        <div style={styles.divider} />

        {/* ── Case 1: Supabase configured → real form ── */}
        {supabaseConfigured && (
          <form onSubmit={handleSubmit} style={styles.form} noValidate>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="coach@titan.io"
                required
                autoComplete="email"
                style={styles.input}
                onFocus={e => Object.assign(e.currentTarget.style, styles.inputFocus)}
                onBlur={e  => Object.assign(e.currentTarget.style, styles.inputBlur)}
              />
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>CONTRASEÑA</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={styles.input}
                onFocus={e => Object.assign(e.currentTarget.style, styles.inputFocus)}
                onBlur={e  => Object.assign(e.currentTarget.style, styles.inputBlur)}
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span style={{ marginRight: 6 }}>⚠</span>{error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                ...styles.btn,
                ...(loading || !email || !password ? styles.btnDisabled : {}),
              }}
            >
              {loading ? (
                <span style={styles.btnLoading}>
                  <span style={styles.dot} /><span style={styles.dot} /><span style={styles.dot} />
                </span>
              ) : 'ENTRAR'}
            </button>
          </form>
        )}

        {/* ── Case 2: Not configured + demo mode available ── */}
        {!supabaseConfigured && demoMode && (
          <div style={styles.demoBlock}>
            <div style={styles.demoBadge}>PREVIEW</div>
            <p style={styles.demoText}>
              Supabase no está configurado.<br />
              Acceso de demostración disponible.
            </p>
            <button style={styles.demoBtn} onClick={handleDemo}>
              ENTRAR EN MODO DEMO
            </button>
            <p style={styles.demoWarning}>
              Solo disponible en entornos de preview.<br />
              Producción requiere autenticación real.
            </p>
          </div>
        )}

        {/* ── Case 3: Not configured + no demo mode → hard block ── */}
        {!supabaseConfigured && !demoMode && (
          <div style={styles.configError}>
            <span style={{ fontSize: 20, display: 'block', marginBottom: 8 }}>⚠</span>
            <strong>Sistema no configurado</strong>
            <p style={{ marginTop: 8, opacity: 0.85, fontWeight: 400 }}>
              Las variables de entorno de Supabase no están definidas.
              El acceso está bloqueado hasta que el administrador las configure.
            </p>
          </div>
        )}

        <div style={styles.footer}>
          ACCESO RESTRINGIDO · SOLO PERSONAL AUTORIZADO
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Rajdhani', sans-serif", overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover', backgroundPosition: 'center 40%',
    transform: 'scale(1.04)', zIndex: 0,
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(5,5,5,0.78) 50%, rgba(0,0,0,0.92) 100%)',
    zIndex: 1,
  },
  scanline: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
    background: 'linear-gradient(90deg, transparent, #00F0FF, transparent)',
    opacity: 0.4, zIndex: 2,
  },
  card: {
    position: 'relative', zIndex: 3,
    width: '100%', maxWidth: '420px', margin: '0 16px',
    background: 'rgba(15, 15, 18, 0.92)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(0, 240, 255, 0.18)', borderRadius: '4px',
    padding: '40px 36px 32px',
    boxShadow: '0 0 60px rgba(0, 240, 255, 0.08), 0 32px 80px rgba(0,0,0,0.6)',
    display: 'flex', flexDirection: 'column',
  },
  logoArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', marginBottom: '28px',
  },
  logoIcon: {
    fontSize: '36px', color: '#00F0FF', lineHeight: 1,
    textShadow: '0 0 20px rgba(0, 240, 255, 0.8)', marginBottom: '4px',
  },
  logoTitle: {
    fontFamily: "'Orbitron', sans-serif", fontSize: '28px', fontWeight: 900,
    color: '#FFFFFF', letterSpacing: '6px', textShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
  },
  logoSub: { fontSize: '11px', color: '#8899A6', letterSpacing: '3px', fontWeight: 500 },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
    marginBottom: '24px',
  },
  configError: {
    background: 'rgba(255, 160, 0, 0.08)', border: '1px solid rgba(255, 160, 0, 0.35)',
    borderRadius: '3px', color: '#FFA500', fontSize: '13px', fontWeight: 600,
    letterSpacing: '0.3px', padding: '16px', textAlign: 'center',
    lineHeight: 1.6, marginBottom: '8px',
  },
  /* Demo mode styles */
  demoBlock: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    background: 'rgba(255, 200, 0, 0.05)', border: '1px solid rgba(255, 200, 0, 0.2)',
    borderRadius: '3px', padding: '24px 20px',
  },
  demoBadge: {
    fontFamily: "'Orbitron', sans-serif", fontSize: '10px', fontWeight: 700,
    letterSpacing: '4px', color: '#FFB800',
    background: 'rgba(255, 184, 0, 0.12)', border: '1px solid rgba(255, 184, 0, 0.3)',
    borderRadius: '2px', padding: '4px 10px',
  },
  demoText: {
    color: '#AABBC8', fontSize: '13px', textAlign: 'center',
    lineHeight: 1.7, margin: 0, fontWeight: 500,
  },
  demoBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.15) 0%, rgba(255, 184, 0, 0.08) 100%)',
    border: '1px solid rgba(255, 184, 0, 0.4)', borderRadius: '3px',
    color: '#FFB800', cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: 700,
    height: '48px', letterSpacing: '2px', transition: 'all 150ms',
    boxShadow: '0 0 16px rgba(255, 184, 0, 0.1)',
  },
  demoWarning: {
    color: 'rgba(136, 153, 166, 0.55)', fontSize: '10px', textAlign: 'center',
    lineHeight: 1.6, margin: 0, letterSpacing: '0.3px',
  },
  /* Form styles */
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: '#8899A6' },
  input: {
    background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '3px', color: '#FFFFFF', fontFamily: "'Rajdhani', sans-serif",
    fontSize: '16px', fontWeight: 500, padding: '14px 16px',
    outline: 'none', transition: 'border-color 200ms, box-shadow 200ms', width: '100%',
  },
  inputFocus: { borderColor: '#00F0FF', boxShadow: '0 0 0 1px rgba(0, 240, 255, 0.3)', background: 'rgba(0, 240, 255, 0.04)' },
  inputBlur:  { borderColor: 'rgba(255, 255, 255, 0.1)', boxShadow: 'none', background: 'rgba(255, 255, 255, 0.04)' },
  errorBox: {
    background: 'rgba(255, 0, 60, 0.1)', border: '1px solid rgba(255, 0, 60, 0.3)',
    borderRadius: '3px', color: '#FF4466', fontSize: '13px', fontWeight: 600,
    letterSpacing: '0.5px', padding: '12px 14px', display: 'flex', alignItems: 'center',
  },
  btn: {
    marginTop: '8px', background: 'linear-gradient(135deg, #00F0FF 0%, #00AACC 100%)',
    border: 'none', borderRadius: '3px', color: '#050505', cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif", fontSize: '14px', fontWeight: 700,
    height: '52px', letterSpacing: '3px',
    transition: 'opacity 150ms, transform 150ms, box-shadow 150ms',
    width: '100%', boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
  },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed', boxShadow: 'none' },
  btnLoading:  { display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' },
  dot:         { width: '6px', height: '6px', background: '#050505', borderRadius: '50%' },
  footer: {
    marginTop: '28px', textAlign: 'center', fontSize: '10px',
    letterSpacing: '2px', color: 'rgba(136, 153, 166, 0.5)', fontWeight: 600,
  },
}
