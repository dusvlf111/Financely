"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/context/AuthProvider'
import type { QuestListItem, QuestStatus, QuestType } from '@/lib/quests/service'

const STATUS_LABEL: Record<QuestStatus, string> = {
  idle: '대기 중',
  active: '활성화',
  in_progress: '진행 중',
  completed: '완료',
  failed: '실패',
  expired: '만료',
}

const FALLBACK_USER_MESSAGE = '로그인이 필요합니다.'
const EMPTY_MESSAGE = '등록된 퀘스트가 없습니다.'

const QUEST_TYPE_ORDER: QuestType[] = ['weekly', 'daily', 'monthly', 'premium', 'event']

const QUEST_TYPE_LABEL: Record<QuestType, { title: string; emptyLabel: string }> = {
  weekly: { title: '주간 퀘스트', emptyLabel: '주간 퀘스트가 없습니다.' },
  daily: { title: '일일 퀘스트', emptyLabel: '일일 퀘스트가 없습니다.' },
  monthly: { title: '월간 퀘스트', emptyLabel: '월간 퀘스트가 없습니다.' },
  premium: { title: '프리미엄 퀘스트', emptyLabel: '프리미엄 퀘스트가 없습니다.' },
  event: { title: '이벤트 퀘스트', emptyLabel: '이벤트 퀘스트가 없습니다.' },
}

const OTHER_TYPE_LABEL = { title: '기타 퀘스트', emptyLabel: '기타 퀘스트가 없습니다.' }

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

  const gold = reward.gold
  if (typeof gold === 'number') {
    parts.push(`골드 +${gold}`)
  }

  const xp = reward.xp
  if (typeof xp === 'number') {
    parts.push(`경험치 +${xp}`)
  }

  const badge = reward.badge
  if (typeof badge === 'string') {
    parts.push(`배지 ${badge}`)
  }

  return parts.length ? parts.join(' · ') : '보상 정보 없음'
}

export default function QuestPage() {
  const { user, profile } = useAuth()
  const [quests, setQuests] = useState<QuestListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setQuests([])
      return
    }

    let isCancelled = false

    const fetchQuests = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/quests', {
          headers: {
            'x-user-id': user.id,
          },
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          const message = body?.error?.message ?? '퀘스트 정보를 불러오지 못했습니다.'
          throw new Error(message)
        }

        const body = (await response.json()) as { data: QuestListItem[] }

        if (!isCancelled) {
          setQuests(body.data)
        }
      } catch (fetchError) {
        if (!isCancelled) {
          const message = fetchError instanceof Error ? fetchError.message : '알 수 없는 오류가 발생했습니다.'
          setError(message)
          setQuests([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchQuests()

    return () => {
      isCancelled = true
    }
  }, [user])

  const questsByType = useMemo(() => {
    const grouped: Record<QuestType, QuestListItem[]> = {
      weekly: [],
      daily: [],
      monthly: [],
      premium: [],
      event: [],
    }

    const fallback: QuestListItem[] = []

    for (const quest of quests) {
      switch (quest.type) {
        case 'weekly':
        case 'daily':
        case 'monthly':
        case 'premium':
        case 'event':
          grouped[quest.type].push(quest)
          break
        default:
          fallback.push(quest)
      }
    }

    return { grouped, fallback }
  }, [quests])

  if (!profile) {
    return (
      <div className="max-w-[768px] mx-auto px-4 py-6">
        <div className="card-md-animated animate__animated animate__fadeInUp p-6 text-center">
          <p>{FALLBACK_USER_MESSAGE}</p>
        </div>
      </div>
    )
  }

  const renderQuestCard = (quest: QuestListItem) => {
  const statusLabel = STATUS_LABEL[quest.progress.status] ?? '알 수 없음'
    const rewardLabel = extractRewardLabel(quest.reward)
    const isCompleted = quest.progress.status === 'completed' || quest.progress.isSuccess === true
    const attemptLabel = `남은 시도 ${quest.progress.remainingAttempts}`
    const expiresAt = formatTimestamp(quest.timer.expiresAt)
    const startsAt = formatTimestamp(quest.timer.startsAt)

    return (
      <div key={quest.id} className="card-md-animated card-scale-in p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{quest.title}</h3>
            {quest.description && <p className="text-sm text-neutral-600">{quest.description}</p>}
          </div>
          {isCompleted && <span className="text-green-600 font-medium">✓ 완료</span>}
        </div>

        <div className="grid gap-2 text-sm text-neutral-700">
          <div className="flex gap-2 flex-wrap">
            <span className="font-medium">상태:</span>
            <span>{statusLabel}</span>
            <span className="text-neutral-500">({attemptLabel})</span>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Image src="/icons/gold_icon.svg" alt="Gold" width={16} height={16} className="w-4 h-4" />
            <span>{rewardLabel}</span>
          </div>
          <div className="flex gap-4 flex-wrap text-xs text-neutral-500">
            <span>시작: {startsAt}</span>
            <span>만료: {expiresAt}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderSection = (key: string, title: string, items: QuestListItem[], emptyLabel: string) => (
    <section key={key} className="mb-8 last:mb-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-neutral-600">총 {items.length}개</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card-md-animated card-scale-in p-4 text-center text-neutral-500">{emptyLabel}</div>
        ) : (
          items.map(renderQuestCard)
        )}
      </div>
    </section>
  )

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <h1 className="text-2xl font-semibold mb-6">퀘스트</h1>

      {error && (
        <div className="card-md-animated card-scale-in p-4 mb-6 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <div className="card-md-animated card-scale-in p-4 bg-neutral-100 animate-pulse h-28" />
          <div className="card-md-animated card-scale-in p-4 bg-neutral-100 animate-pulse h-28" />
        </div>
      ) : quests.length === 0 && !error ? (
        <div className="card-md-animated card-scale-in p-6 text-center text-neutral-500">{EMPTY_MESSAGE}</div>
      ) : (
        <>
          {QUEST_TYPE_ORDER.map((type) => {
            const items = questsByType.grouped[type]
            const { title, emptyLabel } = QUEST_TYPE_LABEL[type]
            const shouldRender = items.length > 0 || type === 'weekly' || type === 'daily'

            return shouldRender ? renderSection(type, title, items, emptyLabel) : null
          })}
          {questsByType.fallback.length > 0
            ? renderSection('other', OTHER_TYPE_LABEL.title, questsByType.fallback, OTHER_TYPE_LABEL.emptyLabel)
            : null}
        </>
      )}
    </div>
  )
}
