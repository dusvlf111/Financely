"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const tabs = [
  { key: 'learn', label: '학습', href: '/learn', icon: '/icons/Home_fill.svg' },
  { key: 'league', label: '리그', href: '/league', icon: '/icons/Road_finish_light.svg' },
  { key: 'quest', label: '퀘스트', href: '/quest', icon: '/icons/Search_alt_light.svg' },
  { key: 'asset', label: '자산', href: '/asset', icon: '/icons/Wallet_light.svg' },
  { key: 'mypage', label: '마이', href: '/mypage', icon: '/icons/User_light.svg' },
]

export default function Navigation() {
  const pathname = usePathname() || ''

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-40">
      <div className="max-w-[768px] mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md flex justify-between py-3 px-6">
          {tabs.map((t) => {
            const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href))
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary-500' : 'text-neutral-400'}`}
              >
                <div className={`w-6 h-6 relative transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>
                  <Image
                    src={t.icon}
                    alt={t.label}
                    width={24}
                    height={24}
                    className={active ? 'brightness-0 saturate-100' : 'brightness-0 saturate-100 opacity-40'}
                    style={{
                      filter: active ? 'invert(42%) sepia(96%) saturate(1845%) hue-rotate(203deg) brightness(97%) contrast(93%)' : 'invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)'
                    }}
                  />
                </div>
                <span className="text-xs font-medium">{t.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
