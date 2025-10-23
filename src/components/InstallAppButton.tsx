"use client"
import React, { useEffect, useRef, useState } from 'react'

// 간단한 beforeinstallprompt 이벤트 핸들러 (타입 최소화)
type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

// 전역 Window에 지연 설치 프롬프트를 안전하게 저장하기 위한 타입 보강
declare global {
  interface Window {
    __deferredInstallPrompt?: DeferredPromptEvent | null
  }
  interface Navigator {
    // iOS Safari PWA 환경에서만 존재하는 프로퍼티
    standalone?: boolean
  }
}

export default function InstallAppButton() {
  const deferredRef = useRef<DeferredPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // 이미 설치되어 있는지 초기 판단
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari PWA (navigator.standalone)
      ((navigator as Navigator & { standalone?: boolean }).standalone === true)
    )
    setInstalled(!!isStandalone)

    // 전역에 보관된 지연 프롬프트가 있으면 재사용
    if (typeof window !== 'undefined' && window.__deferredInstallPrompt) {
      deferredRef.current = window.__deferredInstallPrompt
      setCanInstall(true)
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredRef.current = e as DeferredPromptEvent
      setCanInstall(true)
    }

    const onAppInstalled = () => {
      setInstalled(true)
      setCanInstall(false)
      deferredRef.current = null
      if (typeof window !== 'undefined') {
        window.__deferredInstallPrompt = null
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredRef.current) return
    try {
      setBusy(true)
      await deferredRef.current.prompt()
      const choice = await deferredRef.current.userChoice
      if (choice.outcome === 'accepted') {
        setCanInstall(false)
        deferredRef.current = null
      }
    } catch {
      // 무시: 사용자 취소 등
    } finally {
      setBusy(false)
    }
  }

  // 설치된 경우 버튼 표시 대신 안내 문구
  if (installed) {
    return (
      <section className="card-animated animate__animated animate__fadeInUp p-6">
        <h3 className="font-semibold text-lg mb-2">앱 설치</h3>
        <p className="text-sm text-neutral-600">이미 홈 화면에 설치되어 있습니다.</p>
      </section>
    )
  }

  return (
    <section className="card-animated animate__animated animate__fadeInUp p-6">
      <h3 className="font-semibold text-lg mb-3">앱 설치</h3>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 flex-1">
          홈 화면에 설치하고 더 빠르게 이용해보세요.
        </p>
        <button
          className={`btn-primary whitespace-nowrap ${!canInstall ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={handleInstall}
          disabled={!canInstall || busy}
        >
          {busy ? '설치 중…' : '앱 설치하기'}
        </button>
      </div>
      {!canInstall && (
        <p className="text-xs text-neutral-500 mt-2">
          설치 버튼이 보이지 않으면 브라우저 메뉴(⋮)에서 &quot;앱 설치&quot; 또는 &quot;홈 화면에 추가&quot;를 선택하세요.
        </p>
      )}
    </section>
  )
}
