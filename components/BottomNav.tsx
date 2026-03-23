'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/inicio',   icon: '📡', label: 'INICIO' },
  { href: '/atletas',  icon: '👥', label: 'ATLETAS' },
  { href: '/creador',  icon: '⚙️', label: 'CREADOR' },
  { href: '/oficina',  icon: '💼', label: 'OFICINA' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ href, icon, label }) => {
        // Mark active if pathname starts with the href
        const isActive =
          href === '/inicio'
            ? pathname === '/inicio' || pathname === '/'
            : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={`nav-item${isActive ? ' active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="nav-icon">{icon}</div>
            <div className="nav-label">{label}</div>
          </Link>
        )
      })}
    </nav>
  )
}
