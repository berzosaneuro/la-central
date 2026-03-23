import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { AppProviders } from '@/lib/context'
import { AuthProvider } from '@/lib/auth'
import AppShell from '@/components/AppShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'TITAN OS v3.0',
  description: 'Sistema de gestión profesional para coaches de élite',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TITAN OS',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body>
        {/*
          AuthProvider  → sesión global, useAuth() disponible en toda la app
          AppProviders  → Toast + Modal contexts (sin cambios)
          AppShell      → layout condicional: nav+install en rutas protegidas,
                          pantalla limpia en /login
        */}
        <AuthProvider>
          <AppProviders>
            <AppShell>
              {children}
            </AppShell>
          </AppProviders>
        </AuthProvider>

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(reg => console.log('[SW] Registered:', reg.scope))
                  .catch(err => console.warn('[SW] Registration failed:', err))
              })
            }
          `}
        </Script>
      </body>
    </html>
  )
}
