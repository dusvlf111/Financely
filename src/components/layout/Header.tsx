"use client"
import React from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <header className="flex items-center justify-between py-3">
      <div className="text-lg font-semibold">Financely</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span>🔥</span>
          <span className="text-sm">6</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💰</span>
          <span className="text-sm">1,240</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm">{user.name}</div>
            <button onClick={handleLogout} className="text-sm text-primary-600 underline">
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <Link href="/login" className="text-sm text-primary-600 underline">
              로그인
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
