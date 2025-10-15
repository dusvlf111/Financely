"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEnergy } from '@/lib/store/energyStore'
import { useAuth } from '@/lib/context/AuthProvider'
import EnergyModal from '@/components/modals/EnergyModal'
import { supabase } from '@/lib/supabase/client'
import { LEVEL_CATEGORIES, levelInfo } from '@/lib/game/levels'

export default function LevelProgress() {
  const router = useRouter()
  const { profile } = useAuth()
  const { energy, maxEnergy, remainingSeconds } = useEnergy()
  const [showModal, setShowModal] = useState(false)
  const [levelProgress, setLevelProgress] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    async function fetchLevelProgress() {
      if (!profile) return
      const currentCategory = LEVEL_CATEGORIES[profile.level]
      if (!currentCategory) return

      const { count: totalProblemsInCategory } = await supabase.from('problems').select('id', { count: 'exact' }).eq('category', currentCategory)
      const { data: solvedProblems } = await supabase
        .from('user_solved_problems')
        .select('problem_id')
        .in('problem_id', (await supabase.from('problems').select('id').eq('category', currentCategory)).data?.map(p => p.id) || [])
        .eq('user_id', profile.id)

      setLevelProgress({
        completed: solvedProblems?.length ?? 0,
        total: totalProblemsInCategory ?? 0,
      })
    }

    fetchLevelProgress()
  }, [profile])
  if (!profile) return null

  const currentLevel = profile.level
  const currentLevelInfo = levelInfo[currentLevel] || { tier: `Level ${currentLevel}`, title: '새로운 도전' }


  const progressPercent = levelProgress.total > 0 ? (levelProgress.completed / levelProgress.total) * 100 : 0

  return (
    <div className="bg-white border rounded-md p-4">
      <h4 className="text-sm text-neutral-500">이번 레벨 진행도</h4>
      <div className="mt-2">
        <div className="text-base font-semibold">{currentLevelInfo.tier}</div>
        <div className="text-sm text-neutral-600">
          Level {currentLevel}: {currentLevelInfo.title} ({levelProgress.completed}/{levelProgress.total} 완료)
        </div>
      </div>
      <div className="mt-3">
        <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
          <div className="bg-primary-500 h-3" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">에너지: {energy}</span>
          {energy < maxEnergy && typeof remainingSeconds === 'number' && remainingSeconds > 0 && (
            <span className="text-xs text-neutral-500">({formatTime(remainingSeconds)})</span>
          )}
        </div>
        <div>
          <button
            className="btn-primary py-2 px-4 text-sm"
            onClick={async () => {
              if (energy < 1) {
                setShowModal(true)
                return
              }
              if (!profile) return

              const currentCategory = LEVEL_CATEGORIES[profile.level]
              if (!currentCategory) return

              // 현재 카테고리에서 아직 풀지 않은 문제 찾기
              const { data: allProblems } = await supabase.from('problems').select('id').eq('category', currentCategory)
              const { data: solvedProblems } = await supabase.from('user_solved_problems').select('problem_id').eq('user_id', profile.id)

              const solvedIds = new Set(solvedProblems?.map(p => p.problem_id) || [])
              const unsolvedProblems = allProblems?.filter(p => !solvedIds.has(p.id))

              if (unsolvedProblems && unsolvedProblems.length > 0) {
                const nextProblemId = unsolvedProblems[Math.floor(Math.random() * unsolvedProblems.length)].id
                router.push(`/problems/${nextProblemId}`)
              } else {
                // 모두 풀었다면, 다음 레벨의 첫 문제로 (임시)
                alert('현재 레벨의 모든 문제를 완료했습니다! 다음 레벨로 도전하세요.')
              }
            }}
          >
            다음 문제 풀기
          </button>
          <EnergyModal open={showModal} onClose={() => setShowModal(false)} />
        </div>
      </div>
    </div>
  )
}

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    const mm = m.toString().padStart(2, '0')
    const ss = s.toString().padStart(2, '0')
    return `${mm}:${ss}`
  }
