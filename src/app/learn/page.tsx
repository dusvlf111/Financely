"use client"
import React, { useEffect, useState } from 'react'
import GoldPortfolio from './components/GoldPortfolio'
import LevelProgress from './components/LevelProgress'
import problems, { categories, type Category } from '@/lib/mock/problems'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'

export default function LearnPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="bg-white border rounded-md p-6 text-center">
          <p className="mb-4">로그인이 필요합니다.</p>
          <Link href="/login" className="inline-block bg-primary-600 text-black px-4 py-2 rounded-md">
            로그인하기
          </Link>
        </div>
      </div>
    )
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
      <main className="max-w-[768px] mx-auto px-4 pt-4 pb-28">
        <section className="mb-6">
          <GoldPortfolio />
        </section>

        <section className="mb-6">
          <LevelProgress />
        </section>

        {/* 카테고리 필터 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">카테고리별 학습</h3>
          <div className="bg-white border rounded-md p-4">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-black'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                전체 ({problems.length})
              </button>
              {categories.map(cat => {
                const progress = getCategoryProgress(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-black'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
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
            <div className="bg-white border rounded-md p-6 text-center text-neutral-500">
              해당 카테고리에 문제가 없습니다.
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredProblems.map(p => (
                <div key={p.id} className="bg-white border rounded-md p-4 hover:shadow-lg transition">
                  <Link href={`/problems/${p.id}`} className="block no-underline">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded font-medium">
                            {p.category}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                            p.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            p.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {p.difficulty === 'easy' ? '초급' : p.difficulty === 'medium' ? '중급' : '고급'}
                          </span>
                        </div>
                        <div className="font-semibold text-lg text-gray-900">{p.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{p.description}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-700">⚡ {p.energyCost}</span>
                        <span className="text-green-600 font-semibold">+{p.rewardGold}G</span>
                      </div>
                      <div className="px-4 py-2 bg-primary-600 text-black rounded-md text-sm font-semibold hover:bg-primary-700 transition">
                        풀기 →
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
