"use client"
import React, { useEffect, useState } from 'react'
import GoldPortfolio from './components/GoldPortfolio'
import LevelProgress from './components/LevelProgress'
import LevelWorksheet from './components/LevelWorksheet'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'

export default function LearnPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login')
    }
  }, [mounted, user, router])

  if (!mounted) {
    return (
      <div className="max-w-[768px] mx-auto py-6">
        <div className="bg-white border rounded-md p-6 text-center">
          <p className="mb-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const currentLevel = profile?.level || 0

  return (
    <div>
      <main className="max-w-[768px] mx-auto">
        <section className="mb-6">
          <GoldPortfolio />
        </section>

        <section className="mb-6">
          <LevelProgress />
        </section>

        {/* 레벨별 학습지 */}
        <section className="mb-6">
          <LevelWorksheet level={currentLevel} />
        </section>
      </main>
    </div>
  )
}
