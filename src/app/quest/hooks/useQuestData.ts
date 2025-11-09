import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { QuestListItem, QuestStatus, QuestType } from '@/lib/quests/service'
import { FALLBACK_USER_MESSAGE } from '../constants'
import { createDefaultInteraction, type QuestInteraction, type QuestInteractionState } from '../types'
import { loadCachedQuests, saveCachedQuests } from '../utils/cache'

interface QuestsByTypeResult {
  grouped: Record<QuestType, QuestListItem[]>
  fallback: QuestListItem[]
}

interface UseQuestDataResult {
  quests: QuestListItem[]
  groupedQuests: Record<QuestType, QuestListItem[]>
  fallbackQuests: QuestListItem[]
  isLoading: boolean
  error: string | null
  hasLoaded: boolean
  shouldAnimateCards: boolean
  showSkeleton: boolean
  showEmptyState: boolean
  getInteraction: (questId: string) => QuestInteraction
  handleSelectOption: (questId: string, optionValue: number) => void
  handleStartQuest: (quest: QuestListItem) => Promise<void>
  handleSubmitAnswer: (quest: QuestListItem) => Promise<void>
}

export function useQuestData(userId: string | null): UseQuestDataResult {
  const [quests, setQuests] = useState<QuestListItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(userId))
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [interactionState, setInteractionState] = useState<QuestInteractionState>({})
  const [shouldAnimateCards, setShouldAnimateCards] = useState(true)
  const hydratedUserIdRef = useRef<string | null>(null)

  const updateInteractionState = useCallback(
    (questId: string, patch: Partial<QuestInteraction>) => {
      setInteractionState((prev) => {
        const current = prev[questId] ?? createDefaultInteraction()
        return {
          ...prev,
          [questId]: {
            ...current,
            ...patch,
          },
        }
      })
    },
    []
  )

  const resetState = useCallback(() => {
    setQuests([])
    setInteractionState({})
    setIsLoading(false)
    setHasLoaded(false)
    setShouldAnimateCards(true)
    hydratedUserIdRef.current = null
  }, [])

  useEffect(() => {
    if (!userId) {
      resetState()
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

    if (hydratedUserIdRef.current !== userId) {
      hydratedUserIdRef.current = userId
      const cachedEntry = loadCachedQuests(userId)
      if (cachedEntry && cachedEntry.data.length > 0) {
        hydratedFromCache = true
        setInteractionState({})
        setQuests(cachedEntry.data)
        setError(null)
        setHasLoaded(true)
        setShouldAnimateCards(false)
      } else {
        setShouldAnimateCards(true)
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
            'x-user-id': userId,
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
          saveCachedQuests(userId, body.data)
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
  }, [resetState, userId])


  const questsByType = useMemo<QuestsByTypeResult>(() => {
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

  const hasQuests = quests.length > 0
  const showSkeleton = !hasLoaded || (isLoading && !hasQuests && !error)
  const showEmptyState = hasLoaded && !isLoading && !hasQuests && !error

  const getInteraction = useCallback(
    (questId: string) => interactionState[questId] ?? createDefaultInteraction(),
    [interactionState]
  )

  const handleSelectOption = useCallback(
    (questId: string, optionValue: number) => {
      updateInteractionState(questId, {
        selectedOption: optionValue,
        error: null,
        message: null,
      })
    },
    [updateInteractionState]
  )

  const handleStartQuest = useCallback(
    async (quest: QuestListItem) => {
      if (!userId) {
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
            'x-user-id': userId,
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

          saveCachedQuests(userId, next)
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
    },
    [updateInteractionState, userId]
  )

  const handleSubmitAnswer = useCallback(
    async (quest: QuestListItem) => {
      if (!userId) {
        updateInteractionState(quest.id, { error: FALLBACK_USER_MESSAGE })
        return
      }

      const interaction = interactionState[quest.id] ?? createDefaultInteraction()
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
            'x-user-id': userId,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ option: selectedOption }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          const message = body?.error?.message ?? '답안을 제출할 수 없습니다.'
          throw new Error(message)
        }

        const body = (await response.json()) as {
          data?: {
            questId: string
            status: QuestStatus
            isSuccess: boolean
            timeTakenSeconds?: number | null
            rewardIssued?: boolean | null
          }
        }

        const data = body?.data

        if (!data) {
          throw new Error('결과 정보를 불러올 수 없습니다.')
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

          saveCachedQuests(userId, next)
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
    },
    [interactionState, updateInteractionState, userId]
  )

  return {
    quests,
    groupedQuests: questsByType.grouped,
    fallbackQuests: questsByType.fallback,
    isLoading,
    error,
    hasLoaded,
    shouldAnimateCards,
    showSkeleton,
    showEmptyState,
    getInteraction,
    handleSelectOption,
    handleStartQuest,
    handleSubmitAnswer,
  }
}
