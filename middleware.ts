/**
 * middleware.ts — TITAN OS Route Protection
 * ─────────────────────────────────────────────────────────────────
 * REGLAS DE SEGURIDAD (no negociables):
 *
 *  1. Rutas protegidas SIN sesión        → redirect /login
 *  2. Rutas protegidas CON sesión        → pasa
 *  3. /login CON sesión                  → redirect /inicio
 *  4. Supabase NO configurado            → rutas protegidas bloqueadas
 *                                          (redirect /login, NUNCA bypass)
 *
 * PROHIBIDO: hacer next() en rutas protegidas sin verificar sesión.
 * ─────────────────────────────────────────────────────────────────
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse }        from 'next/server'
import type { NextRequest }    from 'next/server'

const PROTECTED = ['/inicio', '/atletas', '/creador', '/oficina']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected  = PROTECTED.some(r => pathname.startsWith(r))
  const isLogin      = pathname === '/login'

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  /* ── Supabase NO configurado ─────────────────────────────────── */
  if (!supabaseUrl || !supabaseAnon) {
    // Registrar en servidor (no exponer al cliente)
    console.error(
      '[TITAN OS][SECURITY] Supabase no está configurado. ' +
      'Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Las rutas protegidas están BLOQUEADAS.'
    )

    // Bloquear rutas protegidas — sin bypass
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // /login y assets pasan (para poder mostrar el error de config)
    return NextResponse.next({ request })
  }

  /* ── Supabase configurado: verificar sesión ──────────────────── */
  const response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  /* Ruta protegida sin sesión → /login */
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  /* /login con sesión activa → /inicio */
  if (isLogin && session) {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon-192\\.png|icon-512\\.png|sw\\.js|manifest\\.json|.*\\..*).*)',
  ],
}
