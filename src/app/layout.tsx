import './globals.css'
import React from 'react'
import Header from '../components/layout/Header'
import Navigation from '../components/layout/Navigation'
import AuthProvider from '@/lib/context/AuthProvider'

export const metadata = {
  title: 'Financely',
  description: '게임형 금융 학습 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-100 text-neutral-800">
        <AuthProvider>
          <div className="max-w-[768px] mx-auto px-4">
            <Header />
            <main className="pt-4 pb-28">{children}</main>
            <Navigation />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
