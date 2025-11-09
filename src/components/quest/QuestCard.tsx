"use client"
import React from 'react'
import Image from 'next/image'
import type { QuestWithProgress } from '@/lib/types/quest'

interface QuestCardProps {
  quest: QuestWithProgress
  onChallenge: (questId: string) => void
  onClaim?: (questId: string) => void
}

export default function QuestCard({ quest, onChallenge, onClaim }: QuestCardProps) {
  const isCompleted = !!quest.user_completed_at
  const isAttempted = !!quest.user_attempt
  const isFailed = quest.user_attempt?.status === 'failed' || quest.user_attempt?.status === 'timeout'
  const isClaimable = quest.user_attempt?.status === 'completed' && !quest.user_attempt?.reward_claimed
  
  const progressPercent = quest.progress_type 
    ? Math.min(((quest.user_progress || 0) / quest.target) * 100, 100)
    : 0

  // For event quests, show remaining participants
  const remainingParticipants = quest.max_participants 
    ? quest.max_participants - (quest.participants_count || 0)
    : null

  // Determine card style based on quest type
  const getCardStyle = () => {
    if (quest.type === 'premium') {
      return 'border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50'
    }
    if (quest.type === 'event') {
      return 'border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 animate-pulse'
    }
    if (quest.type === 'monthly') {
      return 'border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50'
    }
    return 'bg-white'
  }

  const getBadge = () => {
    if (quest.type === 'premium') {
      return <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">유료 회원 전용</span>
    }
    if (quest.type === 'event') {
      return <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded animate-pulse">깜짝!</span>
    }
    if (quest.type === 'monthly') {
      return <span className="px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded">월간</span>
    }
    return null
  }

  const canChallenge = () => {
    if (isCompleted || isAttempted) return false
    if (quest.type === 'event' && remainingParticipants !== null && remainingParticipants <= 0) return false
    return true
  }

  return (
    <div className={`card-md-animated card-scale-in p-4 ${getCardStyle()}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{quest.title}</h3>
            {getBadge()}
          </div>
          <p className="text-sm text-neutral-600">{quest.description}</p>
        </div>
        {isCompleted && (
          <span className="text-green-600 font-medium ml-2">✓ 완료</span>
        )}
        {isFailed && (
          <span className="text-red-600 font-medium ml-2">✗ 실패</span>
        )}
      </div>

      {/* Progress bar for progress-based quests */}
      {quest.progress_type && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-neutral-600 mb-1">
            <span>진행도</span>
            <span>{quest.user_progress || 0}/{quest.target}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Time limit and participants info */}
      {(quest.time_limit || remainingParticipants !== null) && (
        <div className="flex gap-3 mb-3 text-sm">
          {quest.time_limit && (
            <div className="flex items-center gap-1 text-neutral-600">
              <span>⏱️ {quest.time_limit}초</span>
            </div>
          )}
          {remainingParticipants !== null && (
            <div className="flex items-center gap-1 text-purple-600 font-medium">
              <span>👥 {remainingParticipants}/{quest.max_participants}명 남음</span>
            </div>
          )}
        </div>
      )}

      {/* Rewards */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-sm flex-wrap">
          {quest.reward_gold > 0 && (
            <div className="flex items-center gap-1">
              <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
              <span className="text-green-600 font-medium">+{quest.reward_gold}</span>
            </div>
          )}
          {quest.reward_energy > 0 && (
            <div className="flex items-center gap-1">
              <Image src="/icons/energy_icon.svg" alt="Energy" width={16} height={16} className="w-4 h-4" />
              <span className="text-blue-600">+{quest.reward_energy}</span>
            </div>
          )}
          {quest.reward_stock_name && (
            <div className="flex items-center gap-1">
              <span className="text-purple-600 font-medium">
                📈 {quest.reward_stock_name} {quest.reward_type === '확정' ? '확정' : '응모권'}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="ml-2">
          {canChallenge() && (
            <button
              onClick={() => onChallenge(quest.id)}
              className="px-4 py-2 bg-primary-600 text-black rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              도전하기
            </button>
          )}
          {isClaimable && onClaim && (
            <button
              onClick={() => onClaim(quest.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              보상 받기
            </button>
          )}
          {isCompleted && (
            <span className="text-sm text-neutral-500">보상 수령 완료</span>
          )}
        </div>
      </div>
    </div>
  )
}
