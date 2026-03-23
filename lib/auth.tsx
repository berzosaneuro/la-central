'use client'

/**
 * lib/auth.tsx
 * ─────────────────────────────────────────────────────────────────
 * AuthContext global:
 *  - user      → objeto User de Supabase (null si no logueado)
 *  - session   → sesión activa completa
 *  - loading   → true mientras se resuelve la sesión inicial
 *  - signOut() → cierra sesión y redirige a /login
 *
 * Uso en cualquier componente 'use client':
 *   const { user, loading, signOut } = useAuth()
 * ─────────────────────────────────────────────────────────────────
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/* ── Tipos ─────────────────────────────────────────────────────── */
interface AuthCtx {
  user:     User    | null
  session:  Session | null
  loading:  boolean
  signOut:  () => Promise<void>
}

/* ── Contexto ──────────────────────────────────────────────────── */
const AuthContext = createContext<AuthCtx>({
  user:    null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

/* ── Provider ──────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router  = useRouter()
  const [user,    setUser]    = useState<User    | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /* 1. Sesión inicial (silenciosa) */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    /* 2. Escuchar cambios de sesión en tiempo real */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /* 3. Sign out */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
