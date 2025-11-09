import { NextResponse } from 'next/server'

import { failQuest } from '@/lib/quests/service'
import {
  getUserId,
  invalidPayloadResponse,
  invalidQuestIdResponse,
  mapQuestServiceError,
  unauthorizedResponse,
} from '../../utils'

interface RouteContext {
  params: {
    questId: string
  }
}

const VALID_REASONS = new Set(['timeout', 'manual'])

export async function POST(request: Request, context: RouteContext) {
  const userId = getUserId(request)

  if (!userId) {
    return unauthorizedResponse()
  }

  const questId = context.params?.questId

  if (!questId) {
    return invalidQuestIdResponse()
  }

  let reason: 'timeout' | 'manual' = 'manual'

  try {
    const rawBody = await request.text()

    if (rawBody) {
      const parsed = JSON.parse(rawBody) as Record<string, unknown>
      const providedReason = parsed.reason

      if (providedReason !== undefined) {
        if (typeof providedReason !== 'string' || !VALID_REASONS.has(providedReason)) {
          return invalidPayloadResponse()
        }

        reason = providedReason as 'timeout' | 'manual'
      }
    }
  } catch {
    return invalidPayloadResponse()
  }

  try {
    const result = await failQuest({ userId, questId, reason })
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    return mapQuestServiceError(error)
  }
}
