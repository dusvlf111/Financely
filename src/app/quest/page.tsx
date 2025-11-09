"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthProvider'
import type { Quest, QuestWithProgress, QuestSubmitResponse } from '@/lib/types/quest'
import { 
  fetchQuestsWithProgress, 
  startQuestChallenge, 
  submitQuestAnswer,
  claimQuestReward 
} from '@/lib/quest/questService'
import QuestCard from '@/components/quest/QuestCard'
import QuestConfirmModal from '@/components/quest/QuestConfirmModal'
import QuestSolveModal from '@/components/quest/QuestSolveModal'
import QuestResultModal from '@/components/quest/QuestResultModal'

export default function QuestPage() {
  const { user, profile } = useAuth()
  const [quests, setQuests] = useState<QuestWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [solveModalOpen, setSolveModalOpen] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [questResult, setQuestResult] = useState<QuestSubmitResponse | null>(null)

  useEffect(() => {
    loadQuests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadQuests = async () => {
    if (!user) return
    
    setLoading(true)
    const data = await fetchQuestsWithProgress(user.id)
    setQuests(data)
    setLoading(false)
  }

  const handleChallengeClick = (questId: string) => {
    const quest = quests.find(q => q.id === questId)
    if (!quest) return
    
    setSelectedQuest(quest)
    setConfirmModalOpen(true)
  }

  const handleConfirmChallenge = async () => {
    if (!user || !selectedQuest) return
    
    const success = await startQuestChallenge(user.id, selectedQuest.id)
    if (success) {
      setSolveModalOpen(true)
    } else {
      alert('퀘스트를 시작할 수 없습니다.')
    }
  }

  const handleSubmitAnswer = async (answer: string, timeTaken: number) => {
    if (!user || !selectedQuest) return
    
    const result = await submitQuestAnswer(user.id, selectedQuest.id, answer, timeTaken)
    setQuestResult(result)
    setResultModalOpen(true)
    
    // Reload quests to update UI
    await loadQuests()
  }

  const handleClaimReward = async (questId: string) => {
    if (!user) return
    
    const success = await claimQuestReward(user.id, questId)
    if (success) {
      alert('보상을 받았습니다!')
      await loadQuests()
    } else {
      alert('보상을 받을 수 없습니다.')
    }
  }

  const handleResultModalClose = () => {
    setResultModalOpen(false)
    setQuestResult(null)
    setSelectedQuest(null)
  }

  if (!profile) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="card-md-animated animate__animated animate__fadeInUp p-6 text-center">
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    )
  }

  const dailyQuests = quests.filter(q => q.type === 'daily')
  const weeklyQuests = quests.filter(q => q.type === 'weekly')
  const monthlyQuests = quests.filter(q => q.type === 'monthly')
  const premiumQuests = quests.filter(q => q.type === 'premium')
  const eventQuests = quests.filter(q => q.type === 'event')

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <h1 className="text-2xl font-semibold mb-6">퀘스트</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-neutral-600">퀘스트를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {/* Event Quests (깜짝 퀘스트) */}
          {eventQuests.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>⚡</span>
                  <span>깜짝 퀘스트</span>
                </h2>
                <span className="text-sm text-purple-600 font-medium animate-pulse">선착순!</span>
              </div>
              <div className="space-y-3">
                {eventQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onChallenge={handleChallengeClick}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Monthly Quests */}
          {monthlyQuests.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">월간 퀘스트</h2>
                <span className="text-sm text-neutral-600">이번 달 말까지</span>
              </div>
              <div className="space-y-3">
                {monthlyQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onChallenge={handleChallengeClick}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Premium Quests */}
          {premiumQuests.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">유료 퀘스트</h2>
                <span className="text-sm text-yellow-600 font-medium">이번 달 3회 도전 가능</span>
              </div>
              <div className="space-y-3">
                {premiumQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onChallenge={handleChallengeClick}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Weekly Quests */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">주간 퀘스트</h2>
              <span className="text-sm text-neutral-600">매주 월요일 리셋</span>
            </div>
            <div className="space-y-3">
              {weeklyQuests.length === 0 ? (
                <div className="card-md-animated card-scale-in p-4 text-center text-neutral-500">
                  주간 퀘스트가 없습니다.
                </div>
              ) : (
                weeklyQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onChallenge={handleChallengeClick}
                    onClaim={handleClaimReward}
                  />
                ))
              )}
            </div>
          </section>

          {/* Daily Quests */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">일일 퀘스트</h2>
              <span className="text-sm text-neutral-600">오늘 자정에 리셋</span>
            </div>
            <div className="space-y-3">
              {dailyQuests.length === 0 ? (
                <div className="card-md-animated card-scale-in p-4 text-center text-neutral-500">
                  일일 퀘스트가 없습니다.
                </div>
              ) : (
                dailyQuests.map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onChallenge={handleChallengeClick}
                    onClaim={handleClaimReward}
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      <QuestConfirmModal
        quest={selectedQuest}
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmChallenge}
      />

      <QuestSolveModal
        quest={selectedQuest}
        isOpen={solveModalOpen}
        onClose={() => setSolveModalOpen(false)}
        onSubmit={handleSubmitAnswer}
      />

      <QuestResultModal
        result={questResult}
        isOpen={resultModalOpen}
        onClose={handleResultModalClose}
      />
    </div>
  )
}
