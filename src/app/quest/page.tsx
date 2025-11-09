"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
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

const QUEST_CACHE_KEY = 'financely.questCache.v1'
const QUEST_CACHE_TTL = 1000 * 60 * 5 // 5 minutes

interface QuestCacheEntry {
  data: QuestListItem[]
  updatedAt: number
}

type QuestCacheStore = Record<string, QuestCacheEntry>

function loadCachedQuests(userId: string): QuestCacheEntry | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(QUEST_CACHE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as QuestCacheStore
    const entry = parsed[userId]
    if (!entry) {
      return null
    }

    if (Date.now() - entry.updatedAt > QUEST_CACHE_TTL) {
      return null
    }

    return entry
  } catch {
    return null
  }
}

function saveCachedQuests(userId: string, data: QuestListItem[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const raw = window.sessionStorage.getItem(QUEST_CACHE_KEY)
    const parsed = raw ? (JSON.parse(raw) as QuestCacheStore) : {}
    parsed[userId] = {
      data,
      updatedAt: Date.now(),
    }
    window.sessionStorage.setItem(QUEST_CACHE_KEY, JSON.stringify(parsed))
  } catch {
    // ignore cache failures
  }
}

type InteractionPhase = 'idle' | 'starting' | 'question' | 'submitting' | 'result'

interface QuestInteraction {
  phase: InteractionPhase
  selectedOption: number | null
  message: string | null
  error: string | null
  isSuccess: boolean | null
}

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

export default function QuestPage() {
  const { user, profile } = useAuth()
  const [quests, setQuests] = useState<QuestListItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(() => !!user)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasRevealedQuests, setHasRevealedQuests] = useState(false)
  const [interactionState, setInteractionState] = useState<Record<string, QuestInteraction>>({})
  const hydratedUserIdRef = useRef<string | null>(null)
  const skipNextRevealRef = useRef(false)

  const getDefaultInteraction = () => ({
    phase: 'idle' as InteractionPhase,
    selectedOption: null,
    message: null,
    error: null,
    isSuccess: null,
  })

  const updateInteractionState = (questId: string, patch: Partial<QuestInteraction>) => {
    setInteractionState((prev) => {
      const current = prev[questId] ?? getDefaultInteraction()
      return {
        ...prev,
        [questId]: {
          ...current,
          ...patch,
        },
      }
    })
  }

  useEffect(() => {
    if (!user) {
      setQuests([])
      setInteractionState({})
      setIsLoading(false)
      setHasLoaded(false)
      setHasRevealedQuests(false)
      hydratedUserIdRef.current = null
      return
    }

    let isCancelled = false
    let rafId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let hydratedFromCache = false

    const scheduleHasLoaded = () => {
      if (isCancelled) {
        return
      }

      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        rafId = window.requestAnimationFrame(() => {
          if (!isCancelled) {
            setHasLoaded(true)
          }
        })
      } else {
        timeoutId = setTimeout(() => {
          if (!isCancelled) {
            setHasLoaded(true)
          }
        }, 0)
      }
    }

    if (hydratedUserIdRef.current !== user.id) {
      hydratedUserIdRef.current = user.id
      const cachedEntry = loadCachedQuests(user.id)
      if (cachedEntry && cachedEntry.data.length > 0) {
        hydratedFromCache = true
        setInteractionState({})
        setQuests(cachedEntry.data)
        setError(null)
        setHasLoaded(true)
        setHasRevealedQuests(true)
        skipNextRevealRef.current = true
      }
    }

    const fetchQuests = async () => {
      setIsLoading(true)
      if (!hydratedFromCache) {
        setHasLoaded(false)
      }
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
          saveCachedQuests(user.id, body.data)
          scheduleHasLoaded()
        }
      } catch (fetchError) {
        if (!isCancelled) {
          const message = fetchError instanceof Error ? fetchError.message : '알 수 없는 오류가 발생했습니다.'
          setError(message)
          setQuests([])
          scheduleHasLoaded()
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

      if (rafId !== null && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafId)
      }

      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user])

  useEffect(() => {
    if (!hasLoaded || quests.length === 0) {
      return
    }

    if (typeof window === 'undefined') {
      setHasRevealedQuests(true)
      return
    }

    if (skipNextRevealRef.current) {
      skipNextRevealRef.current = false
      setHasRevealedQuests(true)
      return
    }

    setHasRevealedQuests(false)

    let rafId: number | null = null
    let timeoutId: number | null = null

    const scheduleReveal = () => {
      rafId = window.requestAnimationFrame(() => {
        timeoutId = window.setTimeout(() => {
          setHasRevealedQuests(true)
        }, 80)
      })
    }

    scheduleReveal()

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [hasLoaded, quests])

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

  const handleSelectOption = (questId: string, optionValue: number) => {
    updateInteractionState(questId, {
      selectedOption: optionValue,
      error: null,
      message: null,
    })
  }

  const handleStartQuest = async (quest: QuestListItem) => {
    if (!user) {
      updateInteractionState(quest.id, { error: FALLBACK_USER_MESSAGE })
      return
    }

    updateInteractionState(quest.id, {
      phase: 'starting',
      error: null,
      message: null,
      isSuccess: null,
      selectedOption: null,
    })

    try {
      const response = await fetch(`/api/quests/${quest.id}/start`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.error?.message ?? '퀘스트를 시작할 수 없습니다.'
        throw new Error(message)
      }

      const body = (await response.json()) as {
        data?: {
          questId: string
          status: QuestStatus
          attempts: number
          startedAt?: string | null
          timeLimitSeconds?: number | null
          expiresAt?: string | null
        }
      }
      const data = body?.data

      if (!data) {
        throw new Error('퀘스트 정보를 불러올 수 없습니다.')
      }

      setQuests((prev) => {
        const next = prev.map((item) => {
          if (item.id !== quest.id) {
            return item
          }

          const nextRemaining =
            item.progress.remainingAttempts > 0
              ? Math.max(item.progress.remainingAttempts - 1, 0)
              : item.progress.remainingAttempts

          return {
            ...item,
            progress: {
              ...item.progress,
              status: data.status ?? 'in_progress',
              remainingAttempts: nextRemaining,
              startedAt: data.startedAt ?? item.progress.startedAt,
            },
            timer: {
              ...item.timer,
              limitSeconds: data.timeLimitSeconds ?? item.timer.limitSeconds,
              expiresAt: data.expiresAt ?? item.timer.expiresAt,
              startsAt: data.startedAt ?? item.timer.startsAt,
            },
          }
        })

        saveCachedQuests(user.id, next)
        return next
      })

      updateInteractionState(quest.id, {
        phase: 'question',
        selectedOption: null,
        error: null,
        message: null,
        isSuccess: null,
      })
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : '퀘스트를 시작할 수 없습니다.'
      updateInteractionState(quest.id, {
        phase: 'idle',
        error: message,
        selectedOption: null,
      })
    }
  }

  const handleSubmitAnswer = async (quest: QuestListItem) => {
    if (!user) {
      updateInteractionState(quest.id, { error: FALLBACK_USER_MESSAGE })
      return
    }

    const interaction = interactionState[quest.id] ?? getDefaultInteraction()
    const selectedOption = interaction.selectedOption

    if (!selectedOption) {
      updateInteractionState(quest.id, { error: '답안을 선택해주세요.' })
      return
    }

    updateInteractionState(quest.id, {
      phase: 'submitting',
      error: null,
    })

    try {
      const response = await fetch(`/api/quests/${quest.id}/submit`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ selectedOption }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const message = body?.error?.message ?? '답안을 제출할 수 없습니다.'
        throw new Error(message)
      }

      const body = (await response.json()) as {
        data?: {
          status: QuestStatus
          isSuccess: boolean
          rewardIssued: boolean
          timeTakenSeconds: number | null
        }
      }
      const data = body?.data

      if (!data) {
        throw new Error('제출 결과를 확인할 수 없습니다.')
      }

      setQuests((prev) => {
        const next = prev.map((item) =>
          item.id === quest.id
            ? {
                ...item,
                progress: {
                  ...item.progress,
                  status: data.status,
                  isSuccess: data.isSuccess,
                  submittedAt: new Date().toISOString(),
                },
              }
            : item
        )

        saveCachedQuests(user.id, next)
        return next
      })

      const successMessage = data.isSuccess
        ? '정답입니다! 응모권이 지급 대기 상태입니다.'
        : '아쉽지만 오답입니다. 다음 기회에 도전해 보세요.'

      updateInteractionState(quest.id, {
        phase: 'result',
        message: successMessage,
        isSuccess: data.isSuccess,
      })
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '답안을 제출할 수 없습니다.'
      updateInteractionState(quest.id, {
        phase: 'question',
        error: message,
      })
    }
  }

  const renderQuestCard = (quest: QuestListItem, index: number) => {
    const statusLabel = STATUS_LABEL[quest.progress.status] ?? '알 수 없음'
    const rewardLabel = extractRewardLabel(quest.reward)
    const isCompleted = quest.progress.status === 'completed' || quest.progress.isSuccess === true
    const attemptLabel = `남은 시도 ${quest.progress.remainingAttempts}`
    const expiresAt = formatTimestamp(quest.timer.expiresAt)
    const startsAt = formatTimestamp(quest.timer.startsAt)
    const interaction = interactionState[quest.id] ?? getDefaultInteraction()
    const canStartQuest = quest.type === 'event' && quest.status === 'active'
    const hasAttempts = quest.progress.remainingAttempts > 0
    const isInQuestion = interaction.phase === 'question' || interaction.phase === 'submitting'
    const revealClass = hasRevealedQuests
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-2 pointer-events-none'
    const transitionDelay = `${Math.min(index, 6) * 60}ms`

    return (
      <div
        key={quest.id}
        data-testid="quest-card"
        data-revealed={hasRevealedQuests ? 'true' : 'false'}
        className={`card-md-animated card-scale-in p-4 sm:p-5 transition-all duration-300 ease-out ${revealClass}`}
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
              <p className={`text-xs sm:text-sm ${interaction.isSuccess ? 'text-green-600' : 'text-neutral-700'}`}>{interaction.message}</p>
            )}

            {isInQuestion ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-medium text-neutral-800">정답을 선택하세요.</p>
                <div className="grid gap-2">
                  {quest.options.map((option, index) => {
                    const optionValue = index + 1
                    const isSelected = interaction.selectedOption === optionValue
                    return (
                      <button
                        key={optionValue}
                        type="button"
                        onClick={() => handleSelectOption(quest.id, optionValue)}
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
                  onClick={() => handleSubmitAnswer(quest)}
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
                onClick={() => handleStartQuest(quest)}
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

  const renderSection = (key: string, title: string, items: QuestListItem[], emptyLabel: string) => (
    <section key={key} className="mb-8 last:mb-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        <span className="text-xs sm:text-sm text-neutral-600">총 {items.length}개</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card-md-animated card-scale-in p-4 text-center text-neutral-500">{emptyLabel}</div>
        ) : (
          items.map((quest, index) => renderQuestCard(quest, index))
        )}
      </div>
    </section>
  )

  const hasQuests = quests.length > 0
  const showSkeleton = !hasLoaded || (isLoading && !hasQuests && !error)
  const showEmptyState = hasLoaded && !isLoading && !hasQuests && !error

  return (
    <div className="max-w-[768px] mx-auto px-4 py-6 pb-28">
      <h1 className="text-xl sm:text-2xl font-semibold mb-6">퀘스트</h1>

      {error && (
        <div className="card-md-animated card-scale-in p-4 mb-6 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {showSkeleton ? (
        <div className="space-y-3">
          <div className="card-md-animated card-scale-in p-4 bg-neutral-100 animate-pulse h-28" />
          <div className="card-md-animated card-scale-in p-4 bg-neutral-100 animate-pulse h-28" />
        </div>
      ) : showEmptyState ? (
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
