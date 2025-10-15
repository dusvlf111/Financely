"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import type { Quest } from '@/lib/mock/quests'
import { supabase } from '@/lib/supabase/client'

export default function QuestPage() {
  const { addGold, user, profile } = useAuth()
  const [quests, setQuests] = useState<Quest[]>([])
  const [userQuests, setUserQuests] = useState<Record<string, { progress: number; completed_at: string | null }>>({})

  useEffect(() => {
    async function fetchQuests() {
      if (!user) return

      // 1. 모든 퀘스트 목록 가져오기
      const { data: questsData } = await supabase.from('quests').select('*')
      if (questsData) {
        const formattedQuests: Quest[] = questsData.map(q => ({
          ...q,
          rewardGold: q.reward_gold,
          rewardEnergy: q.reward_energy,
          progress: 0, // 기본값 설정
        }))
        setQuests(formattedQuests)
      }

      // 2. 현재 사용자의 퀘스트 진행도 가져오기
      const { data: userQuestsData } = await supabase
        .from('user_quests')
        .select('quest_id, progress, completed_at')
        .eq('user_id', user.id)

      if (userQuestsData) {
        const userQuestsMap = userQuestsData.reduce((acc, q) => {
          acc[q.quest_id] = { progress: q.progress, completed_at: q.completed_at }
          return acc
        }, {} as Record<string, { progress: number; completed_at: string | null }>)
        setUserQuests(userQuestsMap)
      }
    }

    fetchQuests()
  }, [user])

  const weeklyQuests = quests.filter(q => q.type === 'weekly')
  const dailyQuests = quests.filter(q => q.type === 'daily')

  const handleClaimReward = async (questId: string) => {
    const quest = quests.find(q => q.id === questId)
    const userQuest = userQuests[questId]
    
    // 이미 완료했거나, 진행도가 부족하면 반환
    if (!quest || !user || (userQuest && userQuest.completed_at)) return
    if (!userQuest || userQuest.progress < quest.target) return

    if (addGold) {
      addGold(quest.rewardGold)
    }

    // DB에 완료 상태 저장
    const { data, error } = await supabase
      .from('user_quests')
      .upsert({ user_id: user.id, quest_id: questId, progress: userQuest.progress, completed_at: new Date().toISOString() }, { onConflict: 'user_id, quest_id' })
      .select()
      .single()

    if (data) {
      setUserQuests(prev => ({ ...prev, [questId]: { progress: data.progress, completed_at: data.completed_at } }))
    }
  }

  const renderQuestCard = (quest: Quest) => {
    const userQuest = userQuests[quest.id] || { progress: 0, completed_at: null }
    const isCompleted = !!userQuest.completed_at
    const isClaimable = userQuest.progress >= quest.target && !isCompleted
    const progressPercent = Math.min((userQuest.progress / quest.target) * 100, 100)

    return (
      <div key={quest.id} className="bg-white border rounded-md p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{quest.title}</h3>
            <p className="text-sm text-neutral-600">{quest.description}</p>
          </div>
          {isCompleted && (
            <span className="text-green-600 font-medium">✓ 완료</span>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm text-neutral-600 mb-1">
            <span>진행도</span>
            <span>{userQuest.progress}/{quest.target}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="text-green-600 font-medium">+{quest.rewardGold}G</span>
            {quest.rewardEnergy > 0 && (
              <span className="ml-2 text-blue-600">+{quest.rewardEnergy} 에너지</span>
            )}
          </div>
          {isClaimable && (
            <button
              onClick={() => handleClaimReward(quest.id)}
              className="px-4 py-2 bg-primary-600 text-black rounded-md text-sm"
            >
              보상 받기
            </button>
          )}
          {isCompleted && (
            <span className="text-sm text-neutral-500">보상 수령 완료</span>
          )}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="bg-white border rounded-md p-6 text-center">
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <h1 className="text-2xl font-semibold mb-6">퀘스트</h1>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">주간 퀘스트</h2>
          <span className="text-sm text-neutral-600">남은 기간: 5일 8시간</span>
        </div>
        <div className="space-y-3">
          {weeklyQuests.length === 0 ? (
            <div className="bg-white border rounded-md p-4 text-center text-neutral-500">
              주간 퀘스트가 없습니다.
            </div>
          ) : (
            weeklyQuests.map(renderQuestCard)
          )}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">일일 퀘스트</h2>
          <span className="text-sm text-neutral-600">오늘 자정에 리셋</span>
        </div>
        <div className="space-y-3">
          {dailyQuests.length === 0 ? (
            <div className="bg-white border rounded-md p-4 text-center text-neutral-500">
              일일 퀘스트가 없습니다.
            </div>
          ) : (
            dailyQuests.map(renderQuestCard)
          )}
        </div>
      </section>
    </div>
  )
}
