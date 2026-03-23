/**
 * lib/supabase.ts
 * ─────────────────────────────────────────────────────────────────
 * Cliente Supabase para uso en el BROWSER (componentes 'use client').
 * Singleton: se crea una sola vez por ciclo de vida de la pestaña.
 *
 * Para uso en Server Components o Route Handlers usa createServerClient
 * de @supabase/ssr (ver middleware.ts como referencia).
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/* Aviso en consola (solo runtime, no rompe el build) */
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnon)) {
  console.warn(
    '[Supabase] Variables de entorno no configuradas. ' +
    'Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
    'en Vercel → Settings → Environment Variables.'
  )
}

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnon)

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnon || 'placeholder-anon-key',
  {
    auth: {
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: true,
    },
  }
)
