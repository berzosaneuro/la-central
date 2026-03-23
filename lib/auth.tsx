'use client'

/**
 * lib/auth.tsx
 * ─────────────────────────────────────────────────────────────────
 * Global AuthContext with three distinct states:
 *
 *  1. Supabase configured → real session (User | null from Supabase)
 *  2. Not configured + NEXT_PUBLIC_DEMO_MODE=1 + titan-demo cookie
 *     → demo user (DEMO_USER object, isDemo=true, role='demo')
 *  3. Not configured or no cookie
 *     → user=null, isDemo=false, loading=false
 *
 * signOut clears the demo cookie if present, then redirects /login.
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
import {
  DEMO_USER,
  DEMO_COOKIE,
  DEMO_COOKIE_VALUE,
} from './demo'

// Activated only when NEXT_PUBLIC_DEMO_MODE=1 is set (preview/dev).
// Never set in production.
const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === '1'

function hasDemoCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split(';')
    .some(c => c.trim() === `${DEMO_COOKIE}=${DEMO_COOKIE_VALUE}`)
}

function clearDemoCookie(): void {
  document.cookie = `${DEMO_COOKIE}=0; path=/; max-age=0; SameSite=Lax`
}

/* ── Context interface ───────────────────────────────────────────── */

interface AuthCtx {
  user:         User    | null
  session:      Session | null
  loading:      boolean
  isConfigured: boolean
  /** true only when running as demo user (no real Supabase session) */
  isDemo:       boolean
  /** 'demo' | real Supabase role | null */
  role:         string  | null
  signOut:      () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user:         null,
  session:      null,
  loading:      true,
  isConfigured: false,
  isDemo:       false,
  role:         null,
  signOut:      async () => {},
})

export const useAuth = () => useContext(AuthContext)

/* ── Provider ────────────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user,    setUser]    = useState<User    | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo,  setIsDemo]  = useState(false)
  const [role,    setRole]    = useState<string  | null>(null)

  useEffect(() => {
    /* ── Path A: Supabase not configured ────────────────────────── */
    if (!supabase) {
      if (DEMO_ENABLED && hasDemoCookie()) {
        // Valid demo session: inject the canonical demo user
        setUser(DEMO_USER)
        setIsDemo(true)
        setRole('demo')
      }
      // No supabase, no demo → user stays null
      setLoading(false)
      return
    }

    /* ── Path B: Supabase configured → real session ─────────────── */
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setRole(data.session?.user?.role ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setRole(newSession?.user?.role ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    // Always clear demo cookie on sign-out (no-op if not set)
    if (typeof document !== 'undefined') {
      clearDemoCookie()
    }
    setUser(null)
    setSession(null)
    setIsDemo(false)
    setRole(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isConfigured: supabaseConfigured,
      isDemo,
      role,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
