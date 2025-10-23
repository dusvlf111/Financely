"use client"
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEnergy } from '@/lib/store/energyStore'
import { useAuth } from '@/lib/context/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { LEVEL_CATEGORIES } from '@/lib/game/levels'
import { hapticSuccess, hapticError, hapticGoldIncrease } from '@/lib/utils/haptic'
import type { Problem } from '@/lib/mock/problems'

export function useProblemSolver(problem: Problem | null) {
  const router = useRouter()
  const { energy, consume, add: addEnergy } = useEnergy()
  const { addGold, user, profile, trackQuestProgress, streak, incrementStreak, resetStreak, addXp } = useAuth()

  const [status, setStatus] = useState<'idle' | 'started' | 'submitted' | 'success' | 'fail'>('idle')
  const [answer, setAnswer] = useState('')
  const [earnedBonus, setEarnedBonus] = useState({ gold: 0, energy: 0 })
  const [lostGold, setLostGold] = useState(0)
  const [showEnergyModal, setShowEnergyModal] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationType, setCelebrationType] = useState<'success' | 'error'>('success')
  const [showGoldIncrease, setShowGoldIncrease] = useState(false)
  const [goldIncreaseAmount, setGoldIncreaseAmount] = useState(0)
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)
  const [levelUpInfo, setLevelUpInfo] = useState<{ nextLevel: number; nextCategory: string } | null>(null)

  const handleStart = useCallback(() => {
    if (!problem) return
    if (energy < problem.energyCost) {
      setShowEnergyModal(true)
      return
    }
    consume(problem.energyCost)
    setStatus('started')
  }, [problem, energy, consume])

  const handleSubmit = useCallback(async () => {
    if (!problem || !user) return

    setShowCelebration(false)
    setStatus('submitted')

    const isCorrect = answer.toUpperCase().trim() === (problem.correctAnswer ?? '').toUpperCase().trim() && answer.trim() !== ''

    if (isCorrect) {
      incrementStreak()
      const currentStreak = streak + 1
      let bonusGold = 0
      let bonusEnergy = 0

      switch (currentStreak) {
        case 2: bonusGold = Math.round(problem.rewardGold + 10); break
        case 3: bonusGold = Math.round(problem.rewardGold + 20); bonusEnergy = 1; break
        case 4: bonusGold = Math.round(problem.rewardGold * 2 + 30); bonusEnergy = 1; break
        case 5: bonusGold = Math.round(problem.rewardGold * 3 + 40); bonusEnergy = 2; break
        case 6: bonusGold = Math.round(problem.rewardGold * 3.5 + 50); bonusEnergy = 2; break
        case 7: bonusGold = Math.round(problem.rewardGold * 4 + 60); bonusEnergy = 3; break
        case 8: bonusGold = Math.round(problem.rewardGold * 4.5 + 70); bonusEnergy = 3; break
        case 9: bonusGold = Math.round(problem.rewardGold * 5 + 80); bonusEnergy = 4; break
        case 10: bonusGold = Math.round(problem.rewardGold * 7 + 100); bonusEnergy = 5; break
        default:
          if (currentStreak > 10) {
            bonusGold = Math.round(problem.rewardGold * 7 + 200)
            bonusEnergy = 5
          }
      }

      setEarnedBonus({ gold: bonusGold, energy: bonusEnergy })
      hapticSuccess()
      setStatus('success')

      setTimeout(() => {
        setCelebrationType('success')
        setShowCelebration(true)
      }, 100)

      const totalGold = problem.rewardGold + bonusGold
      setGoldIncreaseAmount(totalGold)
      hapticGoldIncrease()
      setShowGoldIncrease(true)

      if (addGold) addGold(totalGold)
      if (addEnergy && bonusEnergy > 0) addEnergy(bonusEnergy)

      await supabase.from('user_solved_problems').upsert({
        user_id: user.id,
        problem_id: problem.id,
        solved_at: new Date().toISOString(),
      }, { onConflict: 'user_id,problem_id' })

      if (trackQuestProgress) trackQuestProgress('solve_problem')

    } else {
      hapticError()
      setStatus('fail')

      setTimeout(() => {
        setCelebrationType('error')
        setShowCelebration(true)
      }, 100)

      const goldLoss = Math.floor(Math.random() * 50) + 1
      setLostGold(goldLoss)

      await Promise.all([
        resetStreak(),
        addGold ? addGold(-goldLoss) : Promise.resolve(),
      ])
    }
  }, [problem, user, answer, streak, incrementStreak, resetStreak, addGold, addEnergy, trackQuestProgress])

  const handleRetry = useCallback(() => {
    if (!problem) return
    if (energy < problem.energyCost) {
      setShowEnergyModal(true)
      return
    }
    consume(problem.energyCost)
    setAnswer('')
    setStatus('started')
    setEarnedBonus({ gold: 0, energy: 0 })
    setLostGold(0)
    setShowCelebration(false)
    setShowGoldIncrease(false)
  }, [problem, energy, consume])

  const handleLevelUpClose = useCallback(async () => {
    setShowLevelUpModal(false)
    if (!profile || !user) return

    const currentLevel = profile.level
    const nextLevel = levelUpInfo?.nextLevel ?? currentLevel + 1
    const nextCategory = LEVEL_CATEGORIES[nextLevel]

    // ▼▼▼ [오류 수정] ▼▼▼
    // '모든 레벨 완료!' 이거나 유효하지 않은 카테고리일 경우 먼저 처리하여 조기 리턴합니다.
    // 이렇게 하면 TypeScript가 아래의 Supabase 쿼리에서는 nextCategory가 항상 유효한 값임을 추론할 수 있습니다.
    if (!nextCategory || levelUpInfo?.nextCategory === '모든 레벨 완료!') {
      router.push('/learn')
      return
    }
    
    // 다음 레벨의 첫 문제로 이동
    const { data: nextLevelProblems } = await supabase
      .from('problems')
      .select('id')
      .eq('category', nextCategory) // 이 시점에서 nextCategory는 유효한 카테고리 이름입니다.
      .order('id', { ascending: true })
      .limit(1)

    if (nextLevelProblems && nextLevelProblems.length > 0) {
      router.push(`/problems/${nextLevelProblems[0].id}`)
    } else {
      router.push('/learn')
    }
  }, [profile, user, levelUpInfo, router])

  const handleNextProblem = useCallback(async () => {
    if (!problem || !user || !profile) {
      router.push('/learn')
      return
    }

    const currentLevel = profile.level
    const currentCategory = LEVEL_CATEGORIES[currentLevel]

    const { data: solvedProblems } = await supabase
      .from('user_solved_problems')
      .select('problem_id')
      .eq('user_id', user.id)
    const solvedIds = new Set(solvedProblems?.map(p => p.problem_id) || [])

    const { data: currentLevelProblems } = await supabase
      .from('problems')
      .select('id, category')
      .eq('category', currentCategory)
      .order('id', { ascending: true })

    if (currentLevelProblems) {
      const unsolvedInCurrentLevel = currentLevelProblems.filter(p => !solvedIds.has(p.id))
      if (unsolvedInCurrentLevel.length > 0) {
        router.push(`/problems/${unsolvedInCurrentLevel[0].id}`)
        return
      }

      const allCurrentLevelSolved = currentLevelProblems.every(p => solvedIds.has(p.id))
      if (allCurrentLevelSolved && currentLevelProblems.length > 0) {
        const nextLevel = currentLevel + 1
        const nextCategory = LEVEL_CATEGORIES[nextLevel]

        if (nextCategory) {
          if (addXp) await addXp(currentLevel * 100)

          const { data: nextLevelProblems } = await supabase
            .from('problems')
            .select('id')
            .eq('category', nextCategory)
            .order('id', { ascending: true })
            .limit(1)

          if (nextLevelProblems && nextLevelProblems.length > 0) {
            setLevelUpInfo({ nextLevel, nextCategory })
            setShowLevelUpModal(true)
            return
          }
        } else {
          setLevelUpInfo({ nextLevel: currentLevel, nextCategory: '모든 레벨 완료!' })
          setShowLevelUpModal(true)
          return
        }
      }
    }

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

    router.push('/learn')
  }, [problem, user, profile, router, addXp])

  return {
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
    showGoldIncrease,
    goldIncreaseAmount,
    showLevelUpModal,
    levelUpInfo,
    handleStart,
    handleSubmit,
    handleRetry,
    handleLevelUpClose,
    handleNextProblem,
    setStatus,
  }
}