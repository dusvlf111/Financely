"use client"
import React, { useState } from 'react'
import mockQuests from '@/lib/mock/quests'
import { useAuth } from '@/lib/context/AuthProvider'
import type { Quest } from '@/lib/mock/quests'

export default function QuestPage() {
  const { addGold, user } = useAuth()
  const [quests, setQuests] = useState<Quest[]>(mockQuests)

  const weeklyQuests = quests.filter(q => q.type === 'weekly')
  const dailyQuests = quests.filter(q => q.type === 'daily')

  const handleClaimReward = (questId: string) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest || quest.progress < quest.target || quest.completed) return

    if (addGold) {
      addGold(quest.rewardGold)
    }

    setQuests(prev =>
      prev.map(q =>
        q.id === questId ? { ...q, completed: true } : q
      )
    )
  }

  const renderQuestCard = (quest: Quest) => {
    const isClaimable = quest.progress >= quest.target && !quest.completed
    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100)

    return (
      <div key={quest.id} className="bg-white border rounded-md p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{quest.title}</h3>
            <p className="text-sm text-neutral-600">{quest.description}</p>
          </div>
          {quest.completed && (
            <span className="text-green-600 font-medium">✓ 완료</span>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm text-neutral-600 mb-1">
            <span>진행도</span>
            <span>{quest.progress}/{quest.target}</span>
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
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm"
            >
              보상 받기
            </button>
          )}
          {quest.completed && (
            <span className="text-sm text-neutral-500">보상 수령 완료</span>
          )}
        </div>
      </div>
    )
  }

  if (!user) {
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
