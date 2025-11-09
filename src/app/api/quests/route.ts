import { listQuests } from '@/lib/quests/service'
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
    return mapQuestServiceError(error)
  }
}
