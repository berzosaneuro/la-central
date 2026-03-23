/**
 * lib/demo.ts
 * ─────────────────────────────────────────────────────────────────
 * Demo user definition and access control constants.
 *
 * Used by:
 *  - lib/auth.tsx   → sets demo user in AuthContext
 *  - proxy.ts       → blocks restricted routes at edge (server copy)
 *  - components/*   → reads role from AuthContext for UI awareness
 *
 * The DEMO_USER object is typed as the Supabase User interface so
 * it can be set directly in AuthContext without type gymnastics.
 * ─────────────────────────────────────────────────────────────────
 */

import type { User } from '@supabase/supabase-js'

/** Routes a demo user cannot access. Enforced at edge AND in UI. */
export const DEMO_RESTRICTED_ROUTES = ['/creador', '/oficina'] as const

/** Cookie name that signals demo access. */
export const DEMO_COOKIE = 'titan-demo'

/** Cookie value required for access. */
export const DEMO_COOKIE_VALUE = '1'

/** Cookie max-age in seconds: 8 hours. */
export const DEMO_COOKIE_MAX_AGE = 28800

/**
 * Canonical demo user object.
 * Shaped to satisfy the Supabase User interface so AuthContext
 * accepts it without casting hacks.
 */
export const DEMO_USER: User = {
  id:             'demo-user',
  email:          'demo@titan.local',
  role:           'demo',
  aud:            'authenticated',
  created_at:     '2026-01-01T00:00:00.000Z',
  app_metadata:   { provider: 'demo', providers: ['demo'] },
  user_metadata:  { role: 'demo', email: 'demo@titan.local' },
}

/**
 * Returns true if the given pathname is restricted for demo users.
 * Matches exact path and all sub-paths.
 */
export function isDemoRestricted(pathname: string): boolean {
  return DEMO_RESTRICTED_ROUTES.some(
    r => pathname === r || pathname.startsWith(r + '/')
  )
}
