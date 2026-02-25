import { type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware simple - no hacer nada por ahora
  return request.response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
