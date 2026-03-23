/**
 * lib/supabase.ts
 * ─────────────────────────────────────────────────────────────────
 * Cliente Supabase — singleton para uso en componentes 'use client'.
 *
 * DISEÑO DE SEGURIDAD:
 *  - Si las env vars no están definidas → supabase = null (no placeholder)
 *  - supabaseConfigured indica si el cliente está operativo
 *  - El middleware y el login comprueban supabaseConfigured antes de actuar
 *  - Sin config → rutas protegidas bloqueadas (NO bypass)
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** true sólo cuando ambas variables de entorno están presentes */
export const supabaseConfigured = Boolean(url && anon)

/**
 * Cliente real si Supabase está configurado, null en caso contrario.
 * Siempre comprobar supabaseConfigured o `supabase !== null` antes de usar.
 */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, anon, {
      auth: {
        persistSession:     true,
        autoRefreshToken:   true,
        detectSessionInUrl: true,
      },
    })
  : null
