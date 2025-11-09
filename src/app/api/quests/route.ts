import { listQuests, type QuestFilters, type QuestListItem, type QuestStatus } from '@/lib/quests/service'
import { DEFAULT_QUEST_SEEDS } from '@/lib/quests/seed'
import {
  getUserId,
  mapQuestServiceError,
  parseQuestTypeParam,
  successResponse,
  unauthorizedResponse,
} from './utils'

export async function GET(request: Request) {
  const userId = getUserId(request)
  if (!userId) {
    return unauthorizedResponse()
  }

  const typeParam = parseQuestTypeParam(new URL(request.url).searchParams.get('type'))
  if ('error' in typeParam) {
    return typeParam.error
  }

  try {
    const quests = await listQuests(userId, typeParam.filters)
    return successResponse(quests)
  } catch (error) {
    if (isMissingDatabaseConnection(error)) {
      const fallbackQuests = buildMockQuestList(typeParam.filters)
      return successResponse(fallbackQuests)
    }
    return mapQuestServiceError(error)
  }
}

function isMissingDatabaseConnection(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Database connection string is missing')
}

function buildMockQuestList(filters: QuestFilters): QuestListItem[] {
  const seeds = DEFAULT_QUEST_SEEDS.filter((quest) => {
    if (!filters.type) {
      return true
    }
    return quest.type === filters.type
  })

  return seeds.map((quest, index) => {
    const questId = quest.id ?? `mock-quest-${quest.type}-${index + 1}`
    const status: QuestStatus = quest.status ?? 'active'
    const attemptsAllowed = quest.attemptsAllowed ?? 1
    const startAt = quest.startAt ?? null
    const expireAt = quest.expireAt ?? null

    return {
      id: questId,
      title: quest.title,
      description: quest.description ?? null,
      type: quest.type,
      status,
      reward: quest.reward ?? null,
      options: quest.options,
      progress: {
        status: 'idle',
        remainingAttempts: attemptsAllowed,
        startedAt: null,
        submittedAt: null,
        isSuccess: null,
      },
      timer: {
        limitSeconds: quest.timeLimitSeconds ?? 60,
        expiresAt: expireAt ? expireAt.toISOString() : null,
        startsAt: startAt ? startAt.toISOString() : null,
      },
    }
  })
}
