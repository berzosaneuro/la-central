'use client'

import { useEffect, useRef, useState } from 'react'

type Platform = 'android' | 'ios' | 'none'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const [platform, setPlatform] = useState<Platform>('none')
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Detect if already running as standalone (installed)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true

    if (standalone) {
      setIsInstalled(true)
      return
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)

    if (isIOS && isSafari) {
      setPlatform('ios')
      return
    }

    // Listen for Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setPlatform('android')
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setPlatform('none')
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const triggerInstall = async () => {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setPlatform('none')
    }
    deferredPrompt.current = null
  }

  return { platform, isInstalled, triggerInstall }
}
