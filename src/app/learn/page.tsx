"use client"
import React, { useEffect, useState } from 'react'
import GoldPortfolio from './components/GoldPortfolio'
import LevelProgress from './components/LevelProgress'
import ProblemItem from '../problems/ProblemItem'
import { type Problem } from '@/lib/mock/problems' // Type만 가져옵니다.
import { useAuth } from '@/lib/context/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LearnPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [problemStatusFilter, setProblemStatusFilter] = useState<'solved' | 'unsolved'>('solved')
  const [problems, setProblems] = useState<Problem[]>([])
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  const [isProblemsExpanded, setIsProblemsExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login')
    }

    async function fetchSolvedProblems() {
      if (!user) return
      const { data } = await supabase.from('user_solved_problems').select('problem_id').eq('user_id', user.id)
      if (data) {
        setSolvedProblemIds(new Set(data.map(item => item.problem_id)))
      }
    }

    // Supabase에서 문제 데이터 가져오기
    async function fetchProblems() {
      // TODO: 서버 컴포넌트로 변경하여 초기 로딩 성능 개선 고려
      const { data } = await supabase.from('problems').select('*')
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

    fetchProblems().then(fetchSolvedProblems)

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

  const filteredProblems = problems.filter(p => {
    if (problemStatusFilter === 'solved') return solvedProblemIds.has(p.id)
    if (problemStatusFilter === 'unsolved') return !solvedProblemIds.has(p.id)
    return false
  })

  return (
    <div>
      <main className="max-w-[768px] mx-auto">
        <section className="mb-6">
          <GoldPortfolio />
        </section>

        <section className="mb-6">
          <LevelProgress />
        </section>

        {/* 푼 문제 / 안 푼 문제 필터 */}
        <section className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setProblemStatusFilter('unsolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                problemStatusFilter === 'unsolved'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              안 푼 문제
            </button>
            <button
              onClick={() => setProblemStatusFilter('solved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                problemStatusFilter === 'solved'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              푼 문제
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {problemStatusFilter === 'solved' ? '푼 문제' : '안 푼 문제'} ({filteredProblems.length}개)
            </h3>
            {filteredProblems.length > 5 && (
              <button
                onClick={() => setIsProblemsExpanded(!isProblemsExpanded)}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {isProblemsExpanded ? '접기 ▲' : `더보기 (${filteredProblems.length - 5}개) ▼`}
              </button>
            )}
          </div>
          {filteredProblems.length === 0 ? (
            <div className="bg-white border rounded-lg p-6 text-center text-neutral-500">
              {problemStatusFilter === 'solved' ? '아직 푼 문제가 없습니다.' : '모든 문제를 완료했습니다!'}
            </div>
          ) : (
            <div className="grid gap-3">
              {(isProblemsExpanded ? filteredProblems : filteredProblems.slice(0, 5)).map(p => (
                <ProblemItem key={p.id} problem={p} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
