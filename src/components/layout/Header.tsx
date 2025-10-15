"use client"
import React from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEnergy } from '@/lib/store/energyStore'

export default function Header() {
  const { user, logout } = useAuth()
  const { energy, maxEnergy } = useEnergy()
  const { remainingSeconds } = useEnergy()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  if (!user) return null

  return (
    <header className="flex items-center justify-between py-3">
      <div className="text-lg font-semibold">Financely</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="animate-pulse">🔥</span>
          <div className="flex flex-col leading-none">
            <span className="text-sm">{energy}/{maxEnergy}</span>
            {remainingSeconds ? (
              <span className="text-xs text-neutral-500">{Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span>💰</span>
          <span className="text-sm">{user.gold.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm">{user.name}</div>
          <button onClick={handleLogout} className="text-sm text-primary-600 underline">
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}
