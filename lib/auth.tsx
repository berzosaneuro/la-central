'use client'

/**
 * lib/auth.tsx
 * ─────────────────────────────────────────────────────────────────
 * AuthContext global con manejo explícito de supabase = null.
 *
 * Si Supabase no está configurado:
 *  - user, session → null
 *  - loading → false (no bloquea la UI indefinidamente)
 *  - signOut → redirige a /login igualmente
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
import { supabase, supabaseConfigured } from './supabase'

interface AuthCtx {
  user:          User    | null
  session:       Session | null
  loading:       boolean
  isConfigured:  boolean
  signOut:       () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user:          null,
  session:       null,
  loading:       true,
  isConfigured:  false,
  signOut:       async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router  = useRouter()
  const [user,    setUser]    = useState<User    | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /* Supabase no configurado → resolver inmediatamente sin sesión */
    if (!supabase) {
      setLoading(false)
      return
    }

    /* Sesión inicial */
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    /* Cambios de sesión en tiempo real */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isConfigured: supabaseConfigured,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
