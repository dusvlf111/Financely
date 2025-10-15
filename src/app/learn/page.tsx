"use client"
import React, { useEffect, useState } from 'react'
import GoldPortfolio from './components/GoldPortfolio'
import LevelProgress from './components/LevelProgress'
import ProblemItem from '../problems/ProblemItem'
import { categories, type Category, type Problem } from '@/lib/mock/problems' // Type만 가져옵니다.
import { useAuth } from '@/lib/context/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LearnPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [problems, setProblems] = useState<Problem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login')
    }

    // Supabase에서 문제 데이터 가져오기
    async function fetchProblems() {
      // TODO: 서버 컴포넌트로 변경하여 초기 로딩 성능 개선 고려
      const { data, error } = await supabase.from('problems').select('*')
      if (data) {
        // DB (snake_case) -> JS (camelCase)
        const formattedProblems: Problem[] = data.map(p => ({
          ...p,
          correctAnswer: p.correct_answer,
          energyCost: p.energy_cost,
          rewardGold: p.reward_gold,
        }))
        setProblems(formattedProblems)
      }
    }

    fetchProblems()
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

  const filteredProblems = selectedCategory === 'all'
    ? problems
    : problems.filter(p => p.category === selectedCategory)

  // 카테고리별 진행도 계산
  const getCategoryProgress = (cat: Category) => {
    const categoryProblems = problems.filter(p => p.category === cat)
    // TODO: 실제 완료된 문제 추적 시스템 필요
    const completed = 0
    return { total: categoryProblems.length, completed }
  }

  return (
    <div>
      <main className="max-w-[768px] mx-auto">
        <section className="mb-6">
          <GoldPortfolio />
        </section>

        <section className="mb-6">
          <LevelProgress />
        </section>

        {/* 카테고리 필터 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">카테고리별 학습</h3>
          <div className="bg-white border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'btn-category-active' : 'btn-category'}
              >
                전체 ({problems.length})
              </button>
              {categories.map(cat => {
                const progress = getCategoryProgress(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'btn-category-active' : 'btn-category'}
                  >
                    {cat} ({progress.completed}/{progress.total})
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">
            {selectedCategory === 'all' ? '전체 문제' : `${selectedCategory} 문제`}
          </h3>
          {filteredProblems.length === 0 ? (
            <div className="bg-white border rounded-lg p-6 text-center text-neutral-500">
              해당 카테고리에 문제가 없습니다.
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredProblems.map(p => <ProblemItem key={p.id} problem={p} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
