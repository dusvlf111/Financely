"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEnergy } from '@/lib/store/energyStore'
import { useAuth } from '@/lib/context/AuthProvider'
import EnergyModal from '@/components/modals/EnergyModal'
import type { Problem } from '@/lib/mock/problems'
import { supabase } from '@/lib/supabase/client'
import { LEVEL_CATEGORIES } from '@/lib/game/levels'

export default function ProblemPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params.id
  const [problem, setProblem] = useState<Problem | null>(null)
  const { energy, consume, add: addEnergy } = useEnergy()
  const { addGold, user, profile, trackQuestProgress, streak, incrementStreak, resetStreak, updateProfile } = useAuth()
  const [status, setStatus] = useState<'idle' | 'started' | 'submitted' | 'success' | 'fail'>('idle')
  const [answer, setAnswer] = useState('')
  const [earnedBonus, setEarnedBonus] = useState({ gold: 0, energy: 0 })
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login')
    }

    async function fetchProblem() {
      if (!id) return
      const { data, error } = await supabase.from('problems').select('*').eq('id', id).single()
      if (data) {
        // DB (snake_case) -> JS (camelCase)
        const formattedProblem: Problem = {
          ...data,
          correctAnswer: data.correct_answer,
          level: data.level,
          energyCost: data.energy_cost,
          rewardGold: data.reward_gold,
        }
        setProblem(formattedProblem)
      }
    }

    fetchProblem()
  }, [mounted, user, router, id])

  if (!mounted) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="bg-white border rounded-md p-6 text-center">
          <p className="mb-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!problem) return <div className="p-6">문제를 찾을 수 없습니다.</div>

  const prob = problem

  function handleStart() {
    // 에너지 체크
    if (energy < prob.energyCost) {
      setShowModal(true)
      return
    }

    // 에너지 소비
    consume(prob.energyCost)

    // 문제 시작
    setStatus('started')
  }

  function handleSelectOption(selectedAnswer: string) {
    setAnswer(selectedAnswer)
  }

  async function handleSubmit() {
    setStatus('submitted')
    const correct = (prob.correctAnswer ?? '').toString().toUpperCase().trim()
    const userAnswer = answer.toUpperCase().trim()
    if (userAnswer === correct && correct !== '') {
      incrementStreak()
      const currentStreak = streak + 1
      let bonusGold = 0
      let bonusEnergy = 0

      // 연속 정답 보너스 계산
      if (currentStreak >= 10) {
        bonusGold = Math.round(prob.rewardGold * 5.0) // 500% 보너스
        bonusEnergy = 3
      } else if (currentStreak >= 5) {
        bonusGold = Math.round(prob.rewardGold * 1.5) // 150% 보너스
        bonusEnergy = 2
      } else if (currentStreak >= 3) {
        bonusGold = Math.round(prob.rewardGold * 0.5)
        bonusEnergy = 1
      } else if (currentStreak >= 2) {
        bonusGold = Math.round(prob.rewardGold * 0.2) // 20% 보너스
      }

      setEarnedBonus({ gold: bonusGold, energy: bonusEnergy })

      setStatus('success')
      if (addGold) addGold(prob.rewardGold + bonusGold)
      if (trackQuestProgress) {
        trackQuestProgress('solve_problem') // '문제 풀기' 타입의 퀘스트 진행도 업데이트
      }

      // 푼 문제 기록
      if (user) {
        await supabase.from('user_solved_problems').insert({ user_id: user.id, problem_id: prob.id })
        
        // Level-up check logic
        if (profile && updateProfile) {
          const currentCategory = LEVEL_CATEGORIES[profile.level]
          if (!currentCategory) return // Max level reached or invalid level

          // 1. Count total problems in the current level's category
          const { count: totalProblemsInCategory } = await supabase.from('problems').select('id', { count: 'exact' }).eq('category', currentCategory)

          // 2. Count solved problems in that category
          const { count: solvedProblemsInLevel } = await supabase
            .from('user_solved_problems')
            .select('problem_id', { count: 'exact' })
            .in('problem_id', (await supabase.from('problems').select('id').eq('category', currentCategory)).data?.map(p => p.id) || [])
            .eq('user_id', user.id)

          // 3. If all are solved, level up
          if (totalProblemsInCategory !== null && solvedProblemsInLevel !== null && solvedProblemsInLevel >= totalProblemsInCategory) {
            const newLevel = profile.level + 1
            updateProfile({ level: newLevel })
            // TODO: Implement a level-up celebration modal or animation
            console.log(`Leveled up to ${newLevel}!`)
            // Give level-up bonus
            if (bonusEnergy > 0 && addEnergy) addEnergy(bonusEnergy)
          }
        }
      }

    } else {
      setStatus('fail')
      resetStreak()
    }
  }

  function handleRetry() {
    setAnswer('')
    setStatus('idle')
  }

  async function handleNextProblem() {
    if (!problem) {
      router.push('/learn')
      return
    }

    // 1. 현재 카테고리에서 아직 풀지 않은 다른 문제 찾기
    const { data: solvedProblems } = await supabase.from('user_solved_problems').select('problem_id').eq('user_id', user.id)
    const solvedIds = new Set(solvedProblems?.map(p => p.problem_id) || [])

    // .not() 쿼리가 복잡한 IN 절과 함께 불안정하게 동작할 수 있어, JS에서 필터링하는 방식으로 변경합니다.
    const { data: allProblemsInCategory } = await supabase.from('problems').select('id').eq('category', problem.category)
    const unsolvedProblems = allProblemsInCategory?.filter(p => !solvedIds.has(p.id))

    if (unsolvedProblems && unsolvedProblems.length > 0) {
      const nextProblemId = unsolvedProblems[Math.floor(Math.random() * unsolvedProblems.length)].id
      router.push(`/problems/${nextProblemId}`)
      return
    }

    // 2. 현재 카테고리 문제를 다 풀었다면, 다음 레벨의 문제 찾기
    const nextLevel = (profile?.level ?? 0) + 1
    const nextCategory = LEVEL_CATEGORIES[nextLevel]
    if (nextCategory) {
      const { data: nextLevelProblems } = await supabase.from('problems').select('id').eq('category', nextCategory).limit(1)
      if (nextLevelProblems && nextLevelProblems.length > 0) {
        router.push(`/problems/${nextLevelProblems[0].id}`)
        return
      }
    }

    // 모든 문제를 다 풀었으면 학습 페이지로 이동
    alert('모든 카테고리의 문제를 완료했습니다! 대단해요!')
    router.push('/learn')
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <button className="text-sm text-primary-600 underline mb-4" onClick={() => router.push('/learn')}>
        ← 학습 페이지로
      </button>

      <div className="bg-white border rounded-md p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">{problem.category}</span>
          <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">{problem.difficulty}</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">{problem.title}</h2>
        <p className="text-neutral-600 mb-4">{problem.description}</p>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-sm">에너지: ⚡{problem.energyCost}</div>
          <div className="text-sm text-green-600 font-medium">보상: +{problem.rewardGold}G</div>
        </div>

        {/* 시작 전 */}
        {status === 'idle' && (
          <button
            className="w-full btn-primary text-base"
            onClick={handleStart}
          >
            문제 풀기 (⚡{problem.energyCost} 소모)
          </button>
        )}

        {/* 문제 풀이 중 */}
        {status === 'started' && (
          <div className="space-y-4">
            {prob.options && prob.options.length > 0 ? (
              <div className="space-y-3">
                <label className="text-sm font-medium">보기를 선택하세요:</label>
                {prob.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.charAt(0))}
                    className={`w-full text-left p-4 border-2 rounded-md transition ${
                      answer === opt.charAt(0)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">정답을 입력하세요:</label>
                <input
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-md focus:border-primary-600 focus:outline-none"
                  placeholder="정답 입력"
                />
              </div>
            )}
            <div className="flex items-center gap-3 pt-2">
              <button
                className="flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!answer}
              >
                제출하기
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setAnswer('')
                  setStatus('idle')
                }}
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 정답 */}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-lg font-bold text-green-700">정답입니다!</span>
              </div>
              <div className="text-green-700">
                <p>기본 보상 <strong>{prob.rewardGold}G</strong>가 지급되었습니다.</p>
                {earnedBonus.gold > 0 && (
                  <p className="font-bold">🔥 {streak}연속 정답! 보너스 <strong>+{earnedBonus.gold}G</strong> 획득!</p>
                )}
                {earnedBonus.energy > 0 && (
                  <p className="font-bold">⚡ 보너스 에너지 <strong>+{earnedBonus.energy}</strong>개 환급!</p>
                )}
              </div>
            </div>

            {prob.explanation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-semibold text-blue-900 mb-2">📚 해설</h4>
                <p className="text-sm text-blue-800">{prob.explanation}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleNextProblem}
                className="flex-1 btn-primary"
              >
                다음 문제로 →
              </button>
            </div>
          </div>
        )}

        {/* 오답 */}
        {status === 'fail' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-2 border-red-500 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">❌</span>
                <span className="text-lg font-bold text-red-700">아쉽지만 오답입니다</span>
              </div><p className="text-sm text-red-700">🔥 연속 정답 기록이 초기화되었습니다.</p>
              <p className="text-red-700 mb-2">정답: <strong>{prob.correctAnswer}</strong></p>
              <p className="text-sm text-red-600">골드 손실은 없습니다. 다시 도전해보세요!</p>
            </div>

            {prob.explanation && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="font-semibold text-amber-900 mb-2">📚 상세 해설</h4>
                <p className="text-sm text-amber-800">{prob.explanation}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 btn-primary"
              >
                다시 풀기
              </button>
              <button
                onClick={handleNextProblem}
                className="flex-1 btn-secondary"
              >
                다른 문제 풀기
              </button>
            </div>
          </div>
        )}
      </div>
      <EnergyModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
