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

        {/* 상점 CTA */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-neutral-900 mb-1">
                  더 많은 문제를 풀고 싶으신가요?
                </h3>
                <p className="text-xs text-neutral-600">
                  상점에서 특별 아이템을 확인해보세요
                </p>
              </div>
              <button
                onClick={() => router.push('/shop')}
                className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                상점 가기
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
