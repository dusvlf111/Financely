"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
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
  const { addGold, user, profile, trackQuestProgress, streak, incrementStreak, resetStreak, addXp } = useAuth()
  const [status, setStatus] = useState<'idle' | 'started' | 'submitted' | 'success' | 'fail'>('idle')
  const [answer, setAnswer] = useState('')
  const [earnedBonus, setEarnedBonus] = useState({ gold: 0, energy: 0 })
  const [lostGold, setLostGold] = useState(0)
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
      const { data } = await supabase.from('problems').select('*').eq('id', id).single()
      if (data) {
        // DB (snake_case) -> JS (camelCase)
        const formattedProblem: Problem = {
          ...data,
          correctAnswer: data.correct_answer,
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
    const correct = (prob.correctAnswer ?? '').toUpperCase().trim()
    const userAnswer = answer.toUpperCase().trim()
    if (userAnswer === correct && correct !== '') {
      incrementStreak()
      const currentStreak = streak + 1
      let bonusGold = 0
      let bonusEnergy = 0

      // ▼▼▼ [수정됨] 10연승까지 보너스 세분화 ▼▼▼
      switch (currentStreak) {
        case 2:
          // 2연승: +10골드
          bonusGold = Math.round(prob.rewardGold + 10)
          break
        case 3:
          // 3연승: +20골드 + 에너지 1
          bonusGold = Math.round(prob.rewardGold + 20)
          bonusEnergy = 1
          break
        case 4:
          // 4연승: 2.5배 골드 + 에너지 1
          bonusGold = Math.round(prob.rewardGold * 2 + 30 )
          bonusEnergy = 1
          break
        case 5:
          // 5연승: 3배 골드 + 에너지 2
          bonusGold = Math.round(prob.rewardGold * 3 + 40)
          bonusEnergy = 2
          break
        case 6:
          // 6연승: 3.5배 골드 + 에너지 2
          bonusGold = Math.round(prob.rewardGold * 3.5 + 50)
          bonusEnergy = 2
          break
        case 7:
          // 7연승: 4배 골드 + 에너지 3
          bonusGold = Math.round(prob.rewardGold * 4 + 60)
          bonusEnergy = 3
          break
        case 8:
          // 8연승: 4.5배 골드 + 에너지 3
          bonusGold = Math.round(prob.rewardGold * 4.5 + 70)
          bonusEnergy = 3
          break
        case 9:
          // 9연승: 5배 골드 + 에너지 4
          bonusGold = Math.round(prob.rewardGold * 5 + 80)
          bonusEnergy = 4
          break
        case 10:
          // 10연승: 7배 골드 + 에너지 5 (특별 보상!)
          bonusGold = Math.round(prob.rewardGold * 7 + 100)
          bonusEnergy = 5
          break
        default:
          // 11연승 이상일 경우 10연승과 동일한 최대 보상 유지
          if (currentStreak > 10) {
            bonusGold = Math.round(prob.rewardGold * 7 + 200)
            bonusEnergy = 5
          }
          // (1연승일 때는 switch/default에 해당 안 되므로 보너스 0 유지)
      }
      // ▲▲▲ [수정됨] 여기까지 ▲▲▲

      setEarnedBonus({ gold: bonusGold, energy: bonusEnergy })

      setStatus('success')
      if (addGold) addGold(prob.rewardGold + bonusGold)
      if (addEnergy && bonusEnergy > 0) addEnergy(bonusEnergy)

      // 푼 문제를 user_solved_problems 테이블에 기록
      if (user && prob.id) {
        const { error } = await supabase
          .from('user_solved_problems')
          .upsert(
            {
              user_id: user.id,
              problem_id: prob.id,
              solved_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,problem_id',
            }
          )

        if (error) {
          console.error('Error saving solved problem:', error)
        }
      }

      if (trackQuestProgress) {
        trackQuestProgress('solve_problem') // '문제 풀기' 타입의 퀘스트 진행도 업데이트
      }
    } else {
      setStatus('fail')

      // 오답 시 10~30골드 랜덤 차감
      const goldLoss = Math.floor(Math.random() * 21) + 10 // 10 ~ 30
      setLostGold(goldLoss)

      // 연승 초기화 및 골드 차감을 동시에 수행
      await Promise.all([
        resetStreak(),
        addGold ? addGold(-goldLoss) : Promise.resolve()
      ])
    }
  }

  function handleRetry() {
    // 에너지 체크
    if (energy < prob.energyCost) {
      setShowModal(true)
      return
    }
    // 에너지 소비
    consume(prob.energyCost)

    setAnswer('')
    setStatus('started') // 'idle'이 아닌 'started'로 설정하여 바로 문제 풀이 시작
    setEarnedBonus({ gold: 0, energy: 0 })
    setLostGold(0)
  }

  async function handleNextProblem() {
    if (!problem || !user || !profile) {
      router.push('/learn')
      return
    }

    const currentLevel = profile.level
    const currentCategory = LEVEL_CATEGORIES[currentLevel]

    // 1. 사용자가 푼 문제 목록 가져오기
    const { data: solvedProblems } = await supabase
      .from('user_solved_problems')
      .select('problem_id')
      .eq('user_id', user.id)

    const solvedIds = new Set(solvedProblems?.map(p => p.problem_id) || [])

    // 2. 현재 레벨(카테고리)의 모든 문제 가져오기
    const { data: currentLevelProblems } = await supabase
      .from('problems')
      .select('id, category')
      .eq('category', currentCategory)
      .order('id', { ascending: true })

    if (currentLevelProblems) {
      // 3. 현재 레벨에서 안 푼 문제 찾기
      const unsolvedInCurrentLevel = currentLevelProblems.filter(p => !solvedIds.has(p.id))

      if (unsolvedInCurrentLevel.length > 0) {
        // 현재 레벨에 안 푼 문제가 있으면 그 문제로 이동
        router.push(`/problems/${unsolvedInCurrentLevel[0].id}`)
        return
      }

      // 4. 현재 레벨의 모든 문제를 풀었으면 레벨업
      const allCurrentLevelSolved = currentLevelProblems.every(p => solvedIds.has(p.id))

      if (allCurrentLevelSolved && currentLevelProblems.length > 0) {
        // 레벨업!
        const nextLevel = currentLevel + 1
        const nextCategory = LEVEL_CATEGORIES[nextLevel]

        if (nextCategory) {
          // 다음 레벨이 있으면 레벨업 처리
          if (addXp) {
            // 레벨업을 위한 충분한 XP 추가
            await addXp(currentLevel * 100)
          }

          // 다음 레벨의 첫 문제 찾기
          const { data: nextLevelProblems } = await supabase
            .from('problems')
            .select('id')
            .eq('category', nextCategory)
            .order('id', { ascending: true })
            .limit(1)

          if (nextLevelProblems && nextLevelProblems.length > 0) {
            // 레벨업 메시지 표시 후 다음 레벨 문제로 이동
            alert(`🎉 축하합니다! 레벨 ${nextLevel}로 승급했습니다!\n다음 주제: ${nextCategory}`)
            router.push(`/problems/${nextLevelProblems[0].id}`)
            return
          }
        } else {
          // 마지막 레벨까지 완료
          alert('🎊 축하합니다! 모든 레벨을 완료했습니다!')
          router.push('/learn')
          return
        }
      }
    }

    // 5. 전체 문제 중 안 푼 문제 찾기 (폴백)
    const { data: allProblems } = await supabase
      .from('problems')
      .select('id, level')
      .order('level', { ascending: true })

    if (allProblems) {
      const unsolvedProblems = allProblems.filter(p => !solvedIds.has(p.id))

      if (unsolvedProblems.length > 0) {
        router.push(`/problems/${unsolvedProblems[0].id}`)
        return
      }
    }

    // 6. 모든 문제를 다 풀었으면 학습 페이지로
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
          <div className="flex items-center gap-1 text-sm">
            <span>에너지:</span>
            <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} className="w-4 h-4" />
            <span>{problem.energyCost}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <span>보상:</span>
            <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
            <span>+{problem.rewardGold}</span>
          </div>
        </div>

        {/* 시작 전 */}
        {status === 'idle' && (
          <button
            className="w-full btn-primary text-base flex items-center justify-center gap-2"
            onClick={handleStart}
          >
            <span>문제 풀기</span>
            <div className="flex items-center gap-1">
              <span>(</span>
              <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} className="w-4 h-4" />
              <span>{problem.energyCost} 소모)</span>
            </div>
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
              <div className="text-green-700 space-y-1">
                <div className="flex items-center gap-1">
                  <span>기본 보상</span>
                  <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
                  <strong>{prob.rewardGold}</strong>
                  <span>가 지급되었습니다.</span>
                </div>
                {earnedBonus.gold > 0 && (
                  <div className="flex items-center gap-1 font-bold">
                    <span>🔥 {streak}연속 정답! 보너스</span>
                    <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
                    <strong>+{earnedBonus.gold}</strong>
                    <span>획득!</span>
                  </div>
                )}
                {earnedBonus.energy > 0 && (
                  <div className="flex items-center gap-1 font-bold">
                    <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} className="w-4 h-4" />
                    <span>보너스 에너지</span>
                    <strong>+{earnedBonus.energy}</strong>
                    <span>개 환급!</span>
                  </div>
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
              </div>
              <p className="text-sm text-red-700">🔥 연속 정답 기록이 초기화되었습니다.</p>
              <div className="flex items-center gap-1 text-red-700 font-bold mt-1">
                <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
                <span>-{lostGold} 골드가 차감되었습니다.</span>
              </div>
              <p className="text-red-700 mb-2 mt-2">정답: <strong>{prob.correctAnswer}</strong></p>
              <p className="text-sm text-red-600">
                다시 도전하려면 에너지가 {prob.energyCost} 필요합니다.
              </p>
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
                이 문제 다시 풀기
              </button>
            </div>
          </div>
        )}
      </div>
      <EnergyModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}
