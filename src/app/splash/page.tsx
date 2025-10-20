"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthProvider'

export default function SplashPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/learn')
      } else {
        router.replace('/login')
      }
    }, 2000) // 2초 후 이동

    return () => clearTimeout(timer)
  }, [user, router])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 z-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Financely
        </h1>
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
