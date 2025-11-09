import { NextResponse } from 'next/server'
import type { QuestFilters, QuestType } from '@/lib/quests/service'

type ErrorResponse = NextResponse<{ error: { code: string; message?: string } }>
type SuccessResponse<T> = NextResponse<{ data: T }>

const QUEST_TYPES: QuestType[] = ['daily', 'weekly', 'monthly', 'premium', 'event']
const QUEST_TYPE_SET: Set<QuestType> = new Set(QUEST_TYPES)

const ERROR_STATUS_MAP: Record<string, number> = {
  QUEST_NOT_FOUND: 404,
  QUEST_NOT_AVAILABLE_YET: 403,
  QUEST_EXPIRED: 410,
  QUEST_ALREADY_COMPLETED: 409,
  QUEST_ALREADY_IN_PROGRESS: 409,
  QUEST_ATTEMPTS_EXHAUSTED: 409,
  QUEST_NOT_STARTED: 409,
  QUEST_NOT_IN_PROGRESS: 409,
  QUEST_START_FAILED: 500,
  QUEST_SUBMIT_FAILED: 500,
  QUEST_FAIL_UPDATE_FAILED: 500,
}

const ERROR_MESSAGE_MAP: Record<string, string> = {
  QUEST_NOT_FOUND: 'Quest not found',
  QUEST_NOT_AVAILABLE_YET: 'Quest cannot be started yet',
  QUEST_EXPIRED: 'Quest has expired',
  QUEST_ALREADY_COMPLETED: 'Quest already completed',
  QUEST_ALREADY_IN_PROGRESS: 'Quest already in progress',
  QUEST_ATTEMPTS_EXHAUSTED: 'Quest attempts exhausted',
  QUEST_NOT_STARTED: 'Quest has not been started',
  QUEST_NOT_IN_PROGRESS: 'Quest is not in progress',
  QUEST_START_FAILED: 'Failed to start quest',
  QUEST_SUBMIT_FAILED: 'Failed to submit quest',
  QUEST_FAIL_UPDATE_FAILED: 'Failed to update quest status',
}

export function successResponse<T>(data: T, status = 200): SuccessResponse<T> {
  return NextResponse.json({ data }, { status })
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

export function unauthorizedResponse(): ErrorResponse {
  return createErrorResponse(401, 'UNAUTHORIZED', 'Missing x-user-id header')
}

export function invalidPayloadResponse(message?: string): ErrorResponse {
  return createErrorResponse(400, 'INVALID_PAYLOAD', message)
}

export function parseQuestTypeParam(param: string | null):
  | { filters: QuestFilters }
  | { error: ErrorResponse } {
  if (!param) {
    return { filters: {} }
  }

  if (!QUEST_TYPE_SET.has(param as QuestType)) {
    return { error: createErrorResponse(400, 'INVALID_QUEST_TYPE', 'Unsupported quest type filter') }
  }

  return { filters: { type: param as QuestType } }
}

export function getUserId(request: Request): string | null {
  const headerKey = 'x-user-id'
  const userId = request.headers.get(headerKey)
  return userId && userId.trim().length > 0 ? userId : null
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    if (request.body === null) {
      return null
    }

    return (await request.json()) as T
  } catch {
    return null
  }
}

export function validateSelectedOption(value: unknown):
  | { option: number }
  | { error: ErrorResponse } {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return {
      error: invalidPayloadResponse('selectedOption must be an integer between 1 and 5'),
    }
  }

  if (value < 1 || value > 5) {
    return {
      error: invalidPayloadResponse('selectedOption must be between 1 and 5'),
    }
  }

  return { option: value }
}

export function validateFailReason(value: unknown):
  | { reason: 'timeout' | 'manual' }
  | { error: ErrorResponse } {
  if (value === undefined || value === null) {
    return { reason: 'manual' }
  }

  if (value === 'timeout' || value === 'manual') {
    return { reason: value }
  }

  return { error: invalidPayloadResponse('Invalid failure reason') }
}

export function mapQuestServiceError(error: unknown): ErrorResponse {
  const code = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const status = ERROR_STATUS_MAP[code] ?? 500
  const message = ERROR_MESSAGE_MAP[code]
  if (status >= 500) {
    console.error('Quest API error', error)
  }
  return createErrorResponse(status, code, message)
}
