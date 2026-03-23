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

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[Supabase] Faltan variables de entorno.\n' +
    'Asegúrate de definir NEXT_PUBLIC_SUPABASE_URL y ' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Persiste la sesión en localStorage automáticamente
    persistSession: true,
    // Refresca el token antes de que expire
    autoRefreshToken: true,
    // Detecta el callback OAuth en la URL (por si se añade OAuth después)
    detectSessionInUrl: true,
  },
})
