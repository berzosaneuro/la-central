'use client'

/**
 * components/AppShell.tsx
 * ─────────────────────────────────────────────────────────────────
 * Shell condicional del layout:
 *  - /login  → sin BottomNav, sin InstallPrompt, sin app-container
 *  - resto   → comportamiento normal (idéntico al original)
 *
 * No modifica BottomNav ni InstallPrompt — los envuelve desde fuera.
 * ─────────────────────────────────────────────────────────────────
 */

import { usePathname } from 'next/navigation'
import BottomNav     from './BottomNav'
import InstallPrompt from './InstallPrompt'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'

  if (isAuthPage) {
    /* Página de login: pantalla limpia, sin chrome de la app */
    return <>{children}</>
  }

  /* Rutas normales de la app: layout original intacto */
  return (
    <>
      <div className="app-container">
        {children}
      </div>
      <BottomNav />
      <InstallPrompt />
    </>
  )
}
