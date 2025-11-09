import { NextResponse } from 'next/server'

import { startQuest } from '@/lib/quests/service'
import {
  getUserId,
  invalidQuestIdResponse,
  mapQuestServiceError,
  unauthorizedResponse,
} from '../../utils'

interface RouteContext {
  params: {
    questId: string
  }
}

export async function POST(request: Request, context: RouteContext) {
  const userId = getUserId(request)

  if (!userId) {
    return unauthorizedResponse()
  }

  const questId = context.params?.questId

  if (!questId) {
    return invalidQuestIdResponse()
  }

  try {
    const result = await startQuest({ userId, questId })
    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    return mapQuestServiceError(error)
  }
}
