import { startQuest } from '@/lib/quests/service'
import {
  getUserId,
  invalidPayloadResponse,
  mapQuestServiceError,
  successResponse,
  unauthorizedResponse,
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

  try {
    const result = await startQuest({ userId, questId })
    return successResponse(result)
  } catch (error) {
    return mapQuestServiceError(error)
  }
}
