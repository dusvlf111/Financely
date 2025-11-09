import { submitQuest } from '@/lib/quests/service'
import {
  getUserId,
  invalidPayloadResponse,
  mapQuestServiceError,
  readJson,
  successResponse,
  unauthorizedResponse,
  validateSelectedOption,
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

  const payload = await readJson<{ selectedOption?: number }>(request)

  if (!payload) {
    return invalidPayloadResponse('selectedOption is required')
  }

  const validation = validateSelectedOption(payload.selectedOption)

  if ('error' in validation) {
    return validation.error
  }

  try {
    const result = await submitQuest({
      userId,
      questId,
      selectedOption: validation.option,
    })

    return successResponse(result)
  } catch (error) {
    return mapQuestServiceError(error)
  }
}
