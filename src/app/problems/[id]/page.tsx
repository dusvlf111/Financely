"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthProvider'
import EnergyModal from '@/components/modals/EnergyModal'
import CelebrationIcon from '@/components/modals/CelebrationIcon'
import LevelUpModal from '@/components/modals/LevelUpModal'
import type { Problem } from '@/lib/mock/problems'
import { supabase } from '@/lib/supabase/client'
import { useProblemSolver } from './useProblemSolver'
import ProblemHeader from './ProblemHeader'
import ProblemIdleView from './ProblemIdleView'
import ProblemStartedView from './ProblemStartedView'
import ProblemSuccessView from './ProblemSuccessView'
import ProblemFailView from './ProblemFailView'

export default function ProblemPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params.id

  const [problem, setProblem] = useState<Problem | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

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

  const {
    status,
    answer,
    setAnswer,
    earnedBonus,
    lostGold,
    showEnergyModal,
    setShowEnergyModal,
    showCelebration,
    celebrationType,
    setShowCelebration,
    showLevelUpModal,
    levelUpInfo,
    handleStart,
    handleSubmit,
    handleRetry,
    handleLevelUpClose,
    handleNextProblem,
    setStatus,
  } = useProblemSolver(problem)

  if (!mounted) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="card-md-animated animate__animated animate__fadeInUp p-6 text-center">
          <p className="mb-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!problem) return <div className="p-6">로딩중...</div>

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <button className="text-sm text-primary-600 underline mb-4" onClick={() => router.push('/learn')}>
        ← 학습 페이지로
      </button>

      <div className="card-scale-in p-6">
        <ProblemHeader problem={problem} />

        {/* 시작 전 */}
        {status === 'idle' && (
          <ProblemIdleView onStart={handleStart} energyCost={problem.energyCost} />
        )}

        {/* 문제 풀이 중 */}
        {status === 'started' && (
          <ProblemStartedView
            problem={problem}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={handleSubmit}
            onCancel={() => setStatus('idle')}
          />
        )}

        {/* 정답 */}
        {status === 'success' && (
          <ProblemSuccessView problem={problem} earnedBonus={earnedBonus} onNext={handleNextProblem} />
        )}

        {/* 오답 */}
        {status === 'fail' && (
          <ProblemFailView problem={problem} lostGold={lostGold} onRetry={handleRetry} />
        )}
      </div>
      <EnergyModal open={showEnergyModal} onClose={() => setShowEnergyModal(false)} />
      <CelebrationIcon
        show={showCelebration}
        type={celebrationType}
        onComplete={() => setShowCelebration(false)}
      />
      <LevelUpModal
        open={showLevelUpModal}
        onClose={handleLevelUpClose}
        nextLevel={levelUpInfo?.nextLevel ?? 1}
        nextCategory={levelUpInfo?.nextCategory ?? ''}
      />
    </div>
  )
}
