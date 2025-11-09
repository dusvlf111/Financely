import { NextResponse } from 'next/server'
import type { QuestFilters, QuestType } from '@/lib/quests/service'

type ErrorResponse = NextResponse<{ error: { code: string; message?: string } }>

const QUEST_TYPES: QuestType[] = ['daily', 'weekly', 'monthly', 'premium', 'event']
const QUEST_TYPE_SET: Set<QuestType> = new Set(QUEST_TYPES)

const ERROR_STATUS_MAP: Record<string, number> = {
  QUEST_NOT_FOUND: 404,
  QUEST_NOT_AVAILABLE_YET: 409,
  QUEST_EXPIRED: 409,
  QUEST_ALREADY_COMPLETED: 409,
  QUEST_ALREADY_IN_PROGRESS: 409,
  QUEST_ATTEMPTS_EXHAUSTED: 409,
  QUEST_NOT_STARTED: 409,
  QUEST_NOT_IN_PROGRESS: 409,
  QUEST_START_FAILED: 500,
  QUEST_SUBMIT_FAILED: 500,
  QUEST_FAIL_UPDATE_FAILED: 500,
}

export function getUserId(request: Request): string | null {
  const headerKey = 'x-user-id'
  const userId = request.headers.get(headerKey)
  return userId && userId.trim().length > 0 ? userId : null
}

export function unauthorizedResponse(): ErrorResponse {
  return createErrorResponse(401, 'UNAUTHORIZED')
}

export function invalidPayloadResponse(message?: string): ErrorResponse {
  return createErrorResponse(400, 'INVALID_PAYLOAD', message)
}

export function invalidQuestIdResponse(): ErrorResponse {
  return createErrorResponse(400, 'INVALID_QUEST_ID')
}

export function parseQuestTypeParam(param: string | null):
  | { filters: QuestFilters }
  | { error: ErrorResponse } {
  if (!param) {
    return { filters: {} }
  }

  if (!QUEST_TYPE_SET.has(param as QuestType)) {
    return { error: createErrorResponse(400, 'INVALID_QUEST_TYPE') }
  }

  return { filters: { type: param as QuestType } }
}

export function createErrorResponse(status: number, code: string, message?: string): ErrorResponse {
  return NextResponse.json(
    {
      error: {
        code,
        ...(message ? { message } : {}),
      },
    },
    { status }
  )
}

export function mapQuestServiceError(error: unknown): ErrorResponse {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
  const status = ERROR_STATUS_MAP[code] ?? 500
  return createErrorResponse(status, code)
}
