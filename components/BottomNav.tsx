'use client'

import Link        from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { DEMO_RESTRICTED_ROUTES } from '@/lib/demo'

const NAV_ITEMS = [
  { href: '/inicio',  icon: '📡', label: 'INICIO'  },
  { href: '/atletas', icon: '👥', label: 'ATLETAS' },
  { href: '/creador', icon: '⚙️', label: 'CREADOR' },
  { href: '/oficina', icon: '💼', label: 'OFICINA' },
]

const DEMO_BLOCKED = new Set<string>(DEMO_RESTRICTED_ROUTES)

export default function BottomNav() {
  const pathname    = usePathname()
  const { isDemo }  = useAuth()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const isActive = href === '/inicio'
          ? pathname === '/inicio' || pathname === '/'
          : pathname.startsWith(href)

        // Demo users: restricted routes show as locked, link redirects to /inicio
        const locked = isDemo && DEMO_BLOCKED.has(href)

        return (
          <Link
            key={href}
            href={locked ? '/inicio' : href}
            className={`nav-item${isActive ? ' active' : ''}${locked ? ' nav-item--locked' : ''}`}
            style={{
              textDecoration: 'none',
              opacity: locked ? 0.32 : 1,
              pointerEvents: locked ? 'none' : 'auto',
            }}
            aria-disabled={locked}
            tabIndex={locked ? -1 : undefined}
          >
            <div className="nav-icon" style={locked ? { filter: 'grayscale(1)' } : undefined}>
              {locked ? '🔒' : icon}
            </div>
            <div className="nav-label" style={locked ? { color: 'rgba(136,153,166,0.5)' } : undefined}>
              {label}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
