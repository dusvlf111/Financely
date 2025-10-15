"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (user) {
        // 로그인된 사용자는 학습 페이지로
        router.replace('/learn')
      } else {
        // 로그인하지 않은 사용자는 로그인 페이지로
        router.replace('/login')
      }
    }
  }, [mounted, user, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-neutral-600">로딩 중...</p>
    </div>
  )
}
