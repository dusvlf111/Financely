import { failQuest } from '@/lib/quests/service'
import {
  getUserId,
  invalidPayloadResponse,
  mapQuestServiceError,
  readJson,
  successResponse,
  unauthorizedResponse,
  validateFailReason,
} from '../../utils'

interface RouteContext {
  params: Promise<{
    questId: string
  }>
}

export async function POST(request: Request, context: RouteContext) {
  const userId = getUserId(request)

  if (!userId) {
    return unauthorizedResponse()
  }

  const { questId } = await context.params

  if (!questId) {
    return invalidPayloadResponse('questId is required')
  }

  const payload = (await readJson<{ reason?: unknown }>(request)) ?? {}

  const validation = validateFailReason(payload.reason)

  if ('error' in validation) {
    return validation.error
  }

  try {
    const result = await failQuest({ userId, questId, reason: validation.reason })
    return successResponse(result)
  } catch (error) {
    return mapQuestServiceError(error)
  }
}
