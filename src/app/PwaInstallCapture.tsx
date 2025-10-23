"use client"
import { useEffect } from 'react'

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
  interface Window {
    __deferredInstallPrompt?: DeferredPromptEvent | null
  }
}

export default function PwaInstallCapture() {
  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      window.__deferredInstallPrompt = e as DeferredPromptEvent
    }

    const onAppInstalled = () => {
      window.__deferredInstallPrompt = null
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  return null
}
