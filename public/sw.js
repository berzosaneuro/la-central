/* ══════════════════════════════════════════════════════
   TITAN OS — Service Worker
   Strategy:
     • Static assets  → Cache-First (fonts, icons, CSS, JS)
     • HTML pages     → Network-First with cache fallback
     • API calls      → Network-Only (never cache)
   ══════════════════════════════════════════════════════ */

const CACHE_NAME = 'titan-os-v1'
const OFFLINE_URL = '/inicio'

/* Assets to pre-cache on install */
const PRECACHE_URLS = [
  '/',
  '/inicio',
  '/atletas',
  '/creador',
  '/oficina',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

/* ── INSTALL ─────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Pre-cache shell pages — ignore individual failures
      return Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url).catch(() => {}))
      )
    })
  )
  self.skipWaiting()
})

/* ── ACTIVATE ─────────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

/* ── FETCH ────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Never cache API routes or Next.js internals
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('/__nextjs')
  ) {
    return // browser handles normally
  }

  // Static assets (images, icons, fonts) → Cache-First
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML navigation requests → Network-First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  // Default → Network-First
  event.respondWith(networkFirst(request))
})

/* ── STRATEGIES ───────────────────────────────────────── */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // Fallback to offline page for navigation
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_URL)
      if (offlinePage) return offlinePage
    }

    return new Response(
      JSON.stringify({ error: 'Sin conexión' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/* ── BACKGROUND SYNC (future use) ────────────────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
