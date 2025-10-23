"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { type Problem } from '@/lib/mock/problems'

export default function MyPage() {
  const { profile, updateProfile, logout, user } = useAuth()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [editing, setEditing] = useState(false)
  const [problemStatusFilter, setProblemStatusFilter] = useState<'solved' | 'unsolved'>('solved')
  const [problems, setProblems] = useState<Problem[]>([])
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set())
  const [isProblemsExpanded, setIsProblemsExpanded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchSolvedProblems() {
      if (!user) return
      const { data } = await supabase.from('user_solved_problems').select('problem_id').eq('user_id', user.id)
      if (data) {
        setSolvedProblemIds(new Set(data.map(item => item.problem_id)))
      }
    }

    async function fetchProblems() {
      const { data } = await supabase.from('problems').select('*')
      if (data) {
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
  }, [user])

  function handleLogout() {
    logout()
    router.push('/login')
  }

  async function save() {
    if (updateProfile) await updateProfile({ username })
    setEditing(false)
  }

  async function handleDeleteAccount() {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 모든 데이터는 영구적으로 삭제되며 복구할 수 없습니다.')) {
      const { error } = await supabase.rpc('delete_user')
      if (error) {
        alert(`계정 삭제 중 오류가 발생했습니다: ${error.message}`)
      } else {
        alert('계정이 성공적으로 삭제되었습니다.')
        handleLogout()
      }
    }
  }

  const filteredProblems = problems.filter(p => {
    if (problemStatusFilter === 'solved') return solvedProblemIds.has(p.id)
    if (problemStatusFilter === 'unsolved') return !solvedProblemIds.has(p.id)
    return false
  })

  const solvedCount = solvedProblemIds.size
  const totalCount = problems.length

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">마이페이지</h1>

      {/* 프로필 & 통계 섹션 */}
      <section className="card-animated animate__animated animate__fadeInUp stagger-1 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg mb-2">
              {profile ? (profile.username || profile.full_name || '익명') : '비회원'}
            </h2>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
                <span className="font-medium">{profile ? `${profile.gold.toLocaleString()}G` : '—'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} className="w-4 h-4" />
                <span className="font-medium">{profile ? `${profile.energy}` : '—'}</span>
              </div>
              <div>
                <span className="font-medium">Lv.{profile?.level || 0}</span>
              </div>
            </div>
          </div>
          {!editing && (
            <button className="text-sm text-primary-600 hover:text-primary-700" onClick={() => setEditing(true)}>
              편집
            </button>
          )}
        </div>

        {editing && (
          <div className="mb-4 p-4 bg-neutral-50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">사용자 이름</label>
              <input
                className="w-full border px-3 py-2 rounded-md"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="사용자 이름"
              />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm" onClick={save}>저장</button>
              <button className="btn-secondary text-sm" onClick={() => setEditing(false)}>취소</button>
            </div>
          </div>
        )}

        {/* 학습 통계 */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{solvedCount}</div>
            <div className="text-xs text-neutral-500 mt-1">푼 문제</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-400">{totalCount - solvedCount}</div>
            <div className="text-xs text-neutral-500 mt-1">안 푼 문제</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{profile?.streak || 0}</div>
            <div className="text-xs text-neutral-500 mt-1">연속 정답</div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>전체 진행률</span>
            <span>{totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (solvedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      {/* 문제 목록 섹션 */}
      <section className="card-animated animate__animated animate__fadeInUp stagger-2 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">나의 문제 목록</h3>
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setProblemStatusFilter('solved')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              problemStatusFilter === 'solved'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            푼 문제 ({solvedCount})
          </button>
          <button
            onClick={() => setProblemStatusFilter('unsolved')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              problemStatusFilter === 'unsolved'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            안 푼 문제 ({totalCount - solvedCount})
          </button>
        </div>

        {/* 문제 리스트 */}
        {filteredProblems.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            {problemStatusFilter === 'solved' ? '아직 푼 문제가 없습니다.' : '모든 문제를 완료했습니다!'}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {(isProblemsExpanded ? filteredProblems : filteredProblems.slice(0, 3)).map(p => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/problems/${p.id}`)}
                  className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-md cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-neutral-500">{p.category}</span>
                      <span className="text-xs text-neutral-400">Lv.{p.level}</span>
                    </div>
                    <h4 className="text-sm font-medium text-neutral-900">{p.title}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Image src="/icons/gold_icon.svg" alt="Gold" width={14} height={14} className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium text-neutral-600">{p.rewardGold}G</span>
                    </div>
                    {problemStatusFilter === 'solved' && (
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredProblems.length > 3 && (
              <button
                onClick={() => setIsProblemsExpanded(!isProblemsExpanded)}
                className="w-full mt-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {isProblemsExpanded ? '접기 ▲' : `더보기 (${filteredProblems.length - 3}개) ▼`}
              </button>
            )}
          </>
        )}
      </section>

      {/* 계정 관리 섹션 */}
      <section className="card-animated animate__animated animate__fadeInUp stagger-3 p-6">
        <h3 className="font-semibold text-lg mb-4">계정 관리</h3>
        <div className="space-y-2">
          <button className="w-full btn-secondary" onClick={handleLogout}>로그아웃</button>
          <button
            className="w-full text-sm text-red-500 hover:text-red-600 py-2"
            onClick={handleDeleteAccount}
          >
            회원 탈퇴
          </button>
        </div>
      </section>
    </div>
  )
}
