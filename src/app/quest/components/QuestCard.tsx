"use client"

import React from 'react'
import Image from 'next/image'
import type { QuestListItem, QuestStatus } from '@/lib/quests/service'
import { STATUS_LABEL } from '../constants'
import type { QuestInteraction } from '../types'

function formatTimestamp(value: string | null): string {
  if (!value) {
    return '기간 제한 없음'
  }
  return value.replace('T', ' ').slice(0, 16)
}

function extractRewardLabel(reward: Record<string, unknown> | null): string {
  if (!reward) {
    return '보상 정보 없음'
  }

  const parts: string[] = []

  const getNumber = (value: unknown): number | null => (typeof value === 'number' ? value : null)
  const getString = (value: unknown): string | null => (typeof value === 'string' ? value : null)

  const gold = getNumber((reward as Record<string, unknown>).gold)
  if (typeof gold === 'number') {
    parts.push(`골드 +${gold}`)
  }

  const xp = getNumber((reward as Record<string, unknown>).xp)
  if (typeof xp === 'number') {
    parts.push(`경험치 +${xp}`)
  }

  const badge = getString((reward as Record<string, unknown>).badge)
  if (typeof badge === 'string') {
    parts.push(`배지 ${badge}`)
  }

  const label = getString((reward as Record<string, unknown>).label)
  if (label) {
    const quantity = getNumber((reward as Record<string, unknown>).quantity)
    const limited = getNumber((reward as Record<string, unknown>).limited)

    const quantityLabel = quantity ? ` ×${quantity}` : ''
    const limitedLabel = limited ? ` (선착순 ${limited}명)` : ''

    parts.push(`${label}${quantityLabel}${limitedLabel}`)
  }

  return parts.length ? parts.join(' · ') : '보상 정보 없음'
}

interface QuestCardProps {
  quest: QuestListItem
  index: number
  interaction: QuestInteraction
  hasRevealedQuests: boolean
  shouldAnimateCards: boolean
  onSelectOption: (questId: string, optionValue: number) => void
  onStartQuest: (quest: QuestListItem) => Promise<void>
  onSubmitAnswer: (quest: QuestListItem) => Promise<void>
}

export default function QuestCard({
  quest,
  index,
  interaction,
  hasRevealedQuests,
  shouldAnimateCards,
  onSelectOption,
  onStartQuest,
  onSubmitAnswer,
}: QuestCardProps) {
  const statusLabel = STATUS_LABEL[quest.progress.status as QuestStatus] ?? '알 수 없음'
  const rewardLabel = extractRewardLabel(quest.reward)
  const isCompleted = quest.progress.status === 'completed' || quest.progress.isSuccess === true
  const attemptLabel = `남은 시도 ${quest.progress.remainingAttempts}`
  const expiresAt = formatTimestamp(quest.timer.expiresAt)
  const startsAt = formatTimestamp(quest.timer.startsAt)
  const canStartQuest = quest.type === 'event' && quest.status === 'active'
  const hasAttempts = quest.progress.remainingAttempts > 0
  const isInQuestion = interaction.phase === 'question' || interaction.phase === 'submitting'
  const revealClass = hasRevealedQuests ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
  const transitionDelay = `${Math.min(index, 6) * 60}ms`
  const animationClass = shouldAnimateCards ? 'card-md-animated card-scale-in' : 'card-md-animated'

  return (
    <div
      key={quest.id}
      data-testid="quest-card"
      data-revealed={hasRevealedQuests ? 'true' : 'false'}
      className={`${animationClass} p-4 sm:p-5 transition-all duration-300 ease-out ${revealClass}`}
      style={{ transitionDelay }}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-2">
        <div>
          <h3 className="font-semibold text-base sm:text-lg">{quest.title}</h3>
          {quest.description && <p className="text-xs sm:text-sm text-neutral-600">{quest.description}</p>}
        </div>
        {isCompleted && <span className="text-green-600 font-medium text-sm sm:text-base">✓ 완료</span>}
      </div>

      <div className="grid gap-2 text-xs sm:text-sm text-neutral-700">
        <div className="flex gap-2 flex-wrap">
          <span className="font-medium whitespace-nowrap">상태:</span>
          <span>{statusLabel}</span>
          <span className="text-neutral-500">({attemptLabel})</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
          <span>{rewardLabel}</span>
        </div>
        <div className="flex gap-4 flex-wrap text-[11px] sm:text-xs text-neutral-500">
          <span>시작: {startsAt}</span>
          <span>만료: {expiresAt}</span>
        </div>
      </div>

      {quest.type === 'event' && (
        <div className="mt-4 space-y-3">
          {interaction.error && <p className="text-xs sm:text-sm text-red-600">{interaction.error}</p>}
          {interaction.message && (
            <p className={`text-xs sm:text-sm ${interaction.isSuccess ? 'text-green-600' : 'text-neutral-700'}`}>
              {interaction.message}
            </p>
          )}

          {isInQuestion ? (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-medium text-neutral-800">정답을 선택하세요.</p>
              <div className="grid gap-2">
                {quest.options.map((option, optionIndex) => {
                  const optionValue = optionIndex + 1
                  const isSelected = interaction.selectedOption === optionValue
                  return (
                    <button
                      key={optionValue}
                      type="button"
                      onClick={() => onSelectOption(quest.id, optionValue)}
                      disabled={interaction.phase === 'submitting'}
                      className={`rounded border px-3 py-2 text-left text-xs sm:text-sm transition ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 hover:border-primary-200'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => onSubmitAnswer(quest)}
                disabled={!interaction.selectedOption || interaction.phase === 'submitting'}
                className="w-full rounded bg-primary-500 px-3 py-2 text-xs sm:text-sm font-semibold text-white disabled:bg-neutral-300"
              >
                답안 제출
              </button>
            </div>
          ) : null}

          {canStartQuest && !isInQuestion && quest.progress.status !== 'completed' && hasAttempts ? (
            <button
              type="button"
              onClick={() => onStartQuest(quest)}
              disabled={interaction.phase === 'starting'}
              className="w-full rounded bg-primary-500 px-3 py-2 text-xs sm:text-sm font-semibold text-white disabled:bg-neutral-300"
            >
              {interaction.phase === 'starting' ? '도전 준비 중...' : '도전하기'}
            </button>
          ) : null}

          {!hasAttempts && quest.progress.status !== 'completed' && !isInQuestion ? (
            <p className="text-xs sm:text-sm text-neutral-500">남은 도전 기회가 없습니다.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
