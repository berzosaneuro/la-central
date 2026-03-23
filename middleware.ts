/**
 * middleware.ts — TITAN OS Route Protection
 * ─────────────────────────────────────────────────────────────────
 * Reglas:
 *  • Sin sesión + ruta protegida  → redirect /login
 *  • Con sesión + /login          → redirect /inicio
 *  • Resto (assets, SW, manifest) → pass-through
 *
 * Usa @supabase/ssr para leer la sesión del lado del servidor
 * sin exponer el token ni hacer fetch adicional al cliente.
 * ─────────────────────────────────────────────────────────────────
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse }        from 'next/server'
import type { NextRequest }    from 'next/server'

/* Rutas que requieren sesión activa */
const PROTECTED = ['/inicio', '/atletas', '/creador', '/oficina']

export async function middleware(request: NextRequest) {
  /* Respuesta base — se modifica solo si hay redirect */
  const response = NextResponse.next({ request })

  /* Sin env vars configuradas → bypass total (app sin auth) */
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response
  }

  /* Cliente Supabase en edge (gestiona cookies automáticamente) */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          /* Propaga las cookies actualizadas tanto al request como al response */
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  /* Obtener sesión (refresca token si está próximo a expirar) */
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const isProtected  = PROTECTED.some(r => pathname.startsWith(r))

  /* ── Regla 1: sin sesión en ruta protegida → /login ─────────── */
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  /* ── Regla 2: con sesión en /login → /inicio ─────────────────── */
  if (pathname === '/login' && session) {
    const inicioUrl = new URL('/inicio', request.url)
    return NextResponse.redirect(inicioUrl)
  }

  return response
}

/* ── Matcher: excluye assets estáticos y Next.js internals ─────── */
export const config = {
  matcher: [
    /*
     * Procesa todo EXCEPTO:
     *  - _next/static  → chunks JS/CSS compilados
     *  - _next/image   → optimización de imágenes
     *  - archivos con extensión (png, ico, svg, json, js, txt…)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon-192\\.png|icon-512\\.png|sw\\.js|manifest\\.json|.*\\..*).*)',
  ],
}
