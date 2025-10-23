"use client"
import './globals.css'
import React from 'react'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import AuthProvider from '@/lib/context/AuthProvider'
import { EnergyProvider } from '@/lib/store/energyStore'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {  
  const pathname = usePathname()
  const isSplash = pathname === '/splash'
  const isLayoutNeeded = !['/splash', '/login'].includes(pathname)

  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-100 text-neutral-800 text-base">
        <AuthProvider>
          <EnergyProvider>
            {isSplash ? (
            {!isLayoutNeeded ? (
              <>{children}</>
            ) : (
              <div className="max-w-[768px] mx-auto">
                <Header />
                <main className="px-4 pt-4 pb-28">{children}</main>
                <Navigation />
              </div>
            )}
          </EnergyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
