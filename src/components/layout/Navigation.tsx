"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { key: 'learn', label: '학습', href: '/learn' },
  { key: 'league', label: '리그', href: '/league' },
  { key: 'quest', label: '퀘스트', href: '/quest' },
  { key: 'asset', label: '자산', href: '/asset' },
  { key: 'mypage', label: '마이', href: '/mypage' },
]

export default function Navigation() {
  const pathname = usePathname() || ''

  return (
    <nav className="fixed bottom-4 left-0 right-0">
      <div className="max-w-[768px] mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md flex justify-between py-2 px-6">
          {tabs.map((t) => {
            const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href))
            return (
              <Link key={t.key} href={t.href} className={`flex flex-col items-center text-xs ${active ? 'text-primary-600' : 'text-neutral-600'}`}>
                <div className="mb-1">{active ? '●' : '○'}</div>
                <div>{t.label}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
