"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const tabs = [
  { key: 'learn', label: '학습', href: '/learn', icon: '/icons/Home_fill.svg' },
  { key: 'league', label: '리그', href: '/league', icon: '/icons/Road_finish_light.svg' },
  { key: 'quest', label: '퀘스트', href: '/quest', icon: '/icons/Search_alt_light.svg' },
  { key: 'shop', label: '상점', href: '/shop', icon: '/icons/Wallet_light.svg' },
  { key: 'mypage', label: '마이', href: '/mypage', icon: '/icons/User_light.svg' },
]

export default function Navigation() {
  const pathname = usePathname() || ''

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        <div className="bottom-nav-bar">
          {tabs.map((t) => {
            const active = pathname === t.href || (t.href !== '/' && pathname.startsWith(t.href))
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <div className={`nav-icon ${active ? 'nav-icon-active' : 'nav-icon-inactive'}`}>
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
                <span className="nav-label">{t.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
