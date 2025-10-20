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
  const { energy, remainingSeconds } = useEnergy()
  const [showModal, setShowModal] = useState(false)
  const [levelProgress, setLevelProgress] = useState({ completed: 0, total: 0 })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    async function fetchLevelProgress() {
      if (!profile) return
      const currentCategory = LEVEL_CATEGORIES[profile.level]
      if (!currentCategory) return

      try {
        // 현재 카테고리의 모든 문제 ID 가져오기
        const { data: categoryProblems, error: problemsError } = await supabase
          .from('problems')
          .select('id')
          .eq('category', currentCategory)

        if (problemsError) {
          console.error('Error fetching problems:', problemsError)
          return
        }

        const problemIds = categoryProblems?.map(p => p.id) || []
        const totalProblems = problemIds.length

        // 현재 카테고리 문제 중 사용자가 푼 문제 조회
        const { data: solvedProblems, error: solvedError } = await supabase
          .from('user_solved_problems')
          .select('problem_id')
          .eq('user_id', profile.id)
          .in('problem_id', problemIds)

        if (solvedError) {
          console.error('Error fetching solved problems:', solvedError)
          return
        }

        setLevelProgress({
          completed: solvedProblems?.length ?? 0,
          total: totalProblems,
        })
      } catch (error) {
        console.error('Error in fetchLevelProgress:', error)
      }
    }

    fetchLevelProgress()
  }, [profile])
  if (!profile) return null

  const currentLevel = profile.level
  const currentLevelInfo = levelInfo[currentLevel] || { tier: `Level ${currentLevel}`, title: '새로운 도전' }


  const progressPercent = levelProgress.total > 0 ? (levelProgress.completed / levelProgress.total) * 100 : 0

  return (
    <div className="bg-white border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm text-neutral-500">레벨별 학습 주제</h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          {isExpanded ? '접기 ▲' : '펼치기 ▼'}
        </button>
      </div>

      {/* 현재 레벨만 표시 (기본) */}
      <div className={`flex items-center justify-between p-2 rounded-md bg-primary-50 border-2 border-primary-500 ${isExpanded ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-primary-500 text-white">
            {currentLevel}
          </div>
          <div>
            <div className="text-xs font-medium text-primary-700">
              {currentLevelInfo.tier}
            </div>
            <div className="text-sm font-semibold text-primary-900">
              {currentLevelInfo.title}
            </div>
          </div>
        </div>
        <div className="text-xs font-medium text-primary-600">
          {levelProgress.completed}/{levelProgress.total} 완료
        </div>
      </div>

      {/* 모든 레벨 표시 (펼쳤을 때만) */}
      {isExpanded && (
        <div className="space-y-2 mb-4">
          {Object.entries(levelInfo).map(([level, info]) => {
            const levelNum = parseInt(level)
            const isCurrentLevel = levelNum === currentLevel
            const isPastLevel = levelNum < currentLevel

            // 현재 레벨은 위에 이미 표시했으므로 스킵
            if (isCurrentLevel) return null

            return (
              <div
                key={level}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                  isPastLevel
                    ? 'bg-neutral-50'
                    : 'bg-white border border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                    isPastLevel
                      ? 'bg-neutral-300 text-neutral-600'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {levelNum}
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${
                      isPastLevel ? 'text-neutral-600' : 'text-neutral-400'
                    }`}>
                      {info.tier}
                    </div>
                    <div className={`text-sm ${
                      isPastLevel ? 'text-neutral-700' : 'text-neutral-400'
                    }`}>
                      {info.title}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 현재 레벨 진행바 */}
      <div className="mb-4">
        <div className="text-xs text-neutral-500 mb-1">현재 레벨 진행도</div>
        <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
          <div className="bg-primary-500 h-3 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">에너지: {energy}</span>
          {energy < 5 && typeof remainingSeconds === 'number' && remainingSeconds > 0 && (
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

              try {
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
              } catch (error) {
                console.error('Error finding next problem:', error)
                alert('문제를 불러오는 중 오류가 발생했습니다.')
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
