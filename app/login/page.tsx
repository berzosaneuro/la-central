'use client'

/**
 * app/login/page.tsx
 * ─────────────────────────────────────────────────────────────────
 * Pantalla de acceso a TITAN OS.
 * Diseño: fondo Bugatti full-screen + overlay oscuro + tarjeta glass.
 * Lógica: signInWithPassword (Supabase) → redirect /inicio
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [checking, setChecking] = useState(true)  // comprueba sesión activa

  /* ── Si ya hay sesión activa → redirigir sin mostrar login ─── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/inicio')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  /* ── Submit ────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    if (authError) {
      setLoading(false)
      // Mensajes de error en español, sin exponer detalles técnicos
      if (authError.message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Confirma tu email antes de acceder.')
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.')
      }
      return
    }

    // Login correcto → /inicio
    router.replace('/inicio')
  }

  /* ── Pantalla de verificación (evita flash) ────────────────── */
  if (checking) {
    return (
      <div style={styles.root}>
        <div style={styles.bg} />
        <div style={styles.overlay} />
        <div style={{ ...styles.card, alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.spinner} />
        </div>
      </div>
    )
  }

  /* ── Render principal ──────────────────────────────────────── */
  return (
    <div style={styles.root}>

      {/* Fondo: Bugatti */}
      <div style={styles.bg} />

      {/* Overlay oscuro degradado */}
      <div style={styles.overlay} />

      {/* Detalles decorativos */}
      <div style={styles.scanline} />

      {/* Card central */}
      <div style={styles.card}>

        {/* Logo / Marca */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>⬡</div>
          <div style={styles.logoTitle}>TITAN OS</div>
          <div style={styles.logoSub}>SISTEMA DE ÉLITE · v3.0</div>
        </div>

        {/* Separador */}
        <div style={styles.divider} />

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>

          {/* Email */}
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

          {/* Password */}
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

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <span style={{ marginRight: 6 }}>⚠</span>{error}
            </div>
          )}

          {/* Botón */}
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
                <span style={styles.dot} />
                <span style={styles.dot} />
                <span style={styles.dot} />
              </span>
            ) : (
              'ENTRAR'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          ACCESO RESTRINGIDO · SOLO PERSONAL AUTORIZADO
        </div>
      </div>
    </div>
  )
}

/* ─── Estilos inline (aislados del global, no contaminan la app) ─ */
const styles: Record<string, React.CSSProperties> = {
  root: {
    position:        'fixed',
    inset:           0,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    fontFamily:      "'Rajdhani', sans-serif",
    overflow:        'hidden',
  },

  /* Imagen Bugatti full-screen */
  bg: {
    position:          'absolute',
    inset:             0,
    backgroundImage:   `url('https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize:    'cover',
    backgroundPosition:'center 40%',
    transform:         'scale(1.04)',   // oculta bordes en zoom
    transition:        'transform 8s ease-out',
    zIndex:            0,
  },

  /* Overlay oscuro multicapa */
  overlay: {
    position:   'absolute',
    inset:      0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(5,5,5,0.78) 50%, rgba(0,0,0,0.92) 100%)',
    zIndex:     1,
  },

  /* Línea de scan estética */
  scanline: {
    position:     'absolute',
    top:          0,
    left:         0,
    right:        0,
    height:       '1px',
    background:   'linear-gradient(90deg, transparent, #00F0FF, transparent)',
    opacity:      0.4,
    animation:    'scanDown 4s linear infinite',
    zIndex:       2,
  },

  /* Card glass */
  card: {
    position:         'relative',
    zIndex:           3,
    width:            '100%',
    maxWidth:         '420px',
    margin:           '0 16px',
    background:       'rgba(15, 15, 18, 0.92)',
    backdropFilter:   'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border:           '1px solid rgba(0, 240, 255, 0.18)',
    borderRadius:     '4px',
    padding:          '40px 36px 32px',
    boxShadow:        '0 0 60px rgba(0, 240, 255, 0.08), 0 32px 80px rgba(0,0,0,0.6)',
    display:          'flex',
    flexDirection:    'column',
    gap:              '0',
  },

  /* Logo */
  logoArea: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            '8px',
    marginBottom:   '28px',
  },
  logoIcon: {
    fontSize:      '36px',
    color:         '#00F0FF',
    lineHeight:    1,
    textShadow:    '0 0 20px rgba(0, 240, 255, 0.8)',
    marginBottom:  '4px',
  },
  logoTitle: {
    fontFamily:    "'Orbitron', sans-serif",
    fontSize:      '28px',
    fontWeight:    900,
    color:         '#FFFFFF',
    letterSpacing: '6px',
    textShadow:    '0 0 30px rgba(0, 240, 255, 0.4)',
  },
  logoSub: {
    fontSize:      '11px',
    color:         '#8899A6',
    letterSpacing: '3px',
    fontWeight:    500,
  },

  divider: {
    height:       '1px',
    background:   'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)',
    marginBottom: '28px',
  },

  form: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
  },

  fieldWrap: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '8px',
  },

  label: {
    fontSize:      '11px',
    fontWeight:    700,
    letterSpacing: '2px',
    color:         '#8899A6',
  },

  input: {
    background:    'rgba(255, 255, 255, 0.04)',
    border:        '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius:  '3px',
    color:         '#FFFFFF',
    fontFamily:    "'Rajdhani', sans-serif",
    fontSize:      '16px',
    fontWeight:    500,
    padding:       '14px 16px',
    outline:       'none',
    transition:    'border-color 200ms, box-shadow 200ms',
    width:         '100%',
  },

  inputFocus: {
    borderColor:  '#00F0FF',
    boxShadow:    '0 0 0 1px rgba(0, 240, 255, 0.3)',
    background:   'rgba(0, 240, 255, 0.04)',
  },

  inputBlur: {
    borderColor:  'rgba(255, 255, 255, 0.1)',
    boxShadow:    'none',
    background:   'rgba(255, 255, 255, 0.04)',
  },

  errorBox: {
    background:    'rgba(255, 0, 60, 0.1)',
    border:        '1px solid rgba(255, 0, 60, 0.3)',
    borderRadius:  '3px',
    color:         '#FF4466',
    fontSize:      '13px',
    fontWeight:    600,
    letterSpacing: '0.5px',
    padding:       '12px 14px',
    display:       'flex',
    alignItems:    'center',
  },

  btn: {
    marginTop:       '8px',
    background:      'linear-gradient(135deg, #00F0FF 0%, #00AACC 100%)',
    border:          'none',
    borderRadius:    '3px',
    color:           '#050505',
    cursor:          'pointer',
    fontFamily:      "'Orbitron', sans-serif",
    fontSize:        '14px',
    fontWeight:      700,
    height:          '52px',
    letterSpacing:   '3px',
    transition:      'opacity 150ms, transform 150ms, box-shadow 150ms',
    width:           '100%',
    boxShadow:       '0 0 20px rgba(0, 240, 255, 0.3)',
  },

  btnDisabled: {
    opacity:   0.45,
    cursor:    'not-allowed',
    boxShadow: 'none',
  },

  /* Loading dots */
  btnLoading: {
    display:        'flex',
    gap:            '6px',
    justifyContent: 'center',
    alignItems:     'center',
  },
  dot: {
    width:        '6px',
    height:       '6px',
    background:   '#050505',
    borderRadius: '50%',
    animation:    'dotPulse 1.2s infinite',
  },

  /* Spinner para checking */
  spinner: {
    width:        '32px',
    height:       '32px',
    border:       '2px solid rgba(0, 240, 255, 0.2)',
    borderTop:    '2px solid #00F0FF',
    borderRadius: '50%',
    animation:    'spin 0.8s linear infinite',
  },

  footer: {
    marginTop:     '28px',
    textAlign:     'center',
    fontSize:      '10px',
    letterSpacing: '2px',
    color:         'rgba(136, 153, 166, 0.5)',
    fontWeight:    600,
  },
}
