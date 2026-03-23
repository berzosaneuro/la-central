import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Every route is private except /login
const PUBLIC_ROUTES = ['/login']

// Routes blocked for demo users. Mirrors lib/demo.ts (duplicated here
// because proxy.ts runs at the edge and cannot import from lib/).
const DEMO_RESTRICTED = ['/creador', '/oficina']

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

function isDemoRestricted(pathname: string): boolean {
  return DEMO_RESTRICTED.some(r => pathname === r || pathname.startsWith(r + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public routes through (they handle their own UI)
  if (isPublic(pathname)) {
    // If Supabase is configured and user has a session, bounce them to /inicio
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && anon) {
      const res = NextResponse.next({ request })
      const client = createServerClient(url, anon, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
        },
      })
      const { data: { session } } = await client.auth.getSession()
      if (session) {
        return NextResponse.redirect(new URL('/inicio', request.url))
      }
      return res
    }

    // Supabase not configured → show /login with its own UI
    return NextResponse.next({ request })
  }

  // ── All other routes are private ────────────────────────────────

  // ── Demo mode (preview / dev ONLY) ──────────────────────────────
  // Requires DEMO_MODE=1 server env var. Never set in production.
  // Without DEMO_MODE=1 on the server, the cookie is unconditionally
  // ignored — crafting it in production has zero effect.
  if (
    process.env.DEMO_MODE === '1' &&
    request.cookies.get('titan-demo')?.value === '1'
  ) {
    // Demo user cannot access restricted routes
    if (isDemoRestricted(pathname)) {
      return NextResponse.redirect(new URL('/inicio', request.url))
    }
    return NextResponse.next({ request })
  }

  // ── Supabase auth ────────────────────────────────────────────────
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Supabase not configured → lock everything, redirect to /login
  if (!url || !anon) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Supabase configured → verify session
  const response = NextResponse.next({ request })
  const client = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => {
        request.cookies.set(name, value)
        response.cookies.set(name, value, options)
      }),
    },
  })

  const { data: { session } } = await client.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|webp|ico|js|css|woff2?|ttf|json)).*)',
  ],
}
