'use client'

/**
 * components/AppShell.tsx
 * ─────────────────────────────────────────────────────────────────
 * Conditional layout shell:
 *  - /login  → clean screen, no chrome
 *  - demo    → demo banner + normal layout
 *  - normal  → standard layout
 * ─────────────────────────────────────────────────────────────────
 */

import { usePathname } from 'next/navigation'
import { useAuth }     from '@/lib/auth'
import BottomNav       from './BottomNav'
import InstallPrompt   from './InstallPrompt'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname    = usePathname()
  const { isDemo, signOut } = useAuth()
  const isAuthPage  = pathname === '/login'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      {/* Demo mode banner — only rendered when isDemo=true */}
      {isDemo && (
        <div style={banner.root}>
          <div style={banner.left}>
            <span style={banner.dot} />
            <span style={banner.label}>PREVIEW · MODO DEMO</span>
            <span style={banner.sub}>Acceso limitado · /creador y /oficina bloqueados</span>
          </div>
          <button style={banner.exit} onClick={signOut}>
            SALIR
          </button>
        </div>
      )}

      <div
        className="app-container"
        style={isDemo ? { paddingTop: 'calc(var(--header-h, 56px) + 36px)' } : undefined}
      >
        {children}
      </div>

      <BottomNav />
      <InstallPrompt />
    </>
  )
}

/* ── Banner styles ───────────────────────────────────────────────── */
const banner: Record<string, React.CSSProperties> = {
  root: {
    position:       'fixed',
    top:            0,
    left:           0,
    right:          0,
    zIndex:         9999,
    height:         '36px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 16px',
    background:     'rgba(255, 184, 0, 0.10)',
    borderBottom:   '1px solid rgba(255, 184, 0, 0.25)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  left: {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
  },
  dot: {
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   '#FFB800',
    boxShadow:    '0 0 6px #FFB800',
    flexShrink:   0,
  },
  label: {
    fontFamily:    "'Orbitron', sans-serif",
    fontSize:      '10px',
    fontWeight:    700,
    letterSpacing: '2px',
    color:         '#FFB800',
  },
  sub: {
    fontSize:   '10px',
    color:      'rgba(255, 184, 0, 0.55)',
    letterSpacing: '0.3px',
    fontFamily: "'Rajdhani', sans-serif",
  },
  exit: {
    fontFamily:    "'Orbitron', sans-serif",
    fontSize:      '9px',
    fontWeight:    700,
    letterSpacing: '2px',
    color:         '#FFB800',
    background:    'rgba(255, 184, 0, 0.12)',
    border:        '1px solid rgba(255, 184, 0, 0.3)',
    borderRadius:  '2px',
    padding:       '4px 10px',
    cursor:        'pointer',
    height:        '24px',
    display:       'flex',
    alignItems:    'center',
  },
}
