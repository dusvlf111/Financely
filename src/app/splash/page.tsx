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
    <div className="fixed inset-0 flex items-center justify-center bg-primary-500 z-50">
      <h1 className="text-4xl font-bold text-white">
        Financely
      </h1>
    </div>
  )
}
