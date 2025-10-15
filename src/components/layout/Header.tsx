"use client"
import React from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import Link from 'next/link'
import { useEnergy } from '@/lib/store/energyStore'
export default function Header() {
  const { user } = useAuth()
  const { energy, maxEnergy } = useEnergy()
  const { remainingSeconds } = useEnergy()

  if (!user) return null

  return (
    <header className="flex items-center justify-between py-3 px-4">
      <Link href="/learn" className="text-xl font-bold text-primary-500">
        Financely
      </Link>

      <div className="flex items-center gap-4">
        {/* 에너지 */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border rounded-lg px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold">{energy}</span>
          {energy < maxEnergy && remainingSeconds && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* 골드 */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border rounded-lg px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.766 1.324 2.246.484.308.994.546 1.676.662v1.941c-.391-.127-.755-.3-1.074-.514a1 1 0 10-1.226 1.616c.64.486 1.391.81 2.25 1.007V16a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 14.766 14 13.991 14 13c0-.99-.602-1.766-1.324-2.246A4.535 4.535 0 0011 10.092V8.151c.391.127.755.3 1.074.514a1 1 0 101.226-1.616c-.64-.486-1.391-.81-2.25-1.007V4a1 1 0 10-2 0v.092z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold">{user.gold.toLocaleString()}</span>
        </div>

        {/* 프로필 */}
        <Link href="/mypage">
          <div className="h-9 w-9 bg-neutral-200 rounded-full flex items-center justify-center border-2 border-white hover:border-primary-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </Link>
      </div>
    </header>
  )
}
