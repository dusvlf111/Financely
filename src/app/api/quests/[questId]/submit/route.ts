import { NextResponse } from 'next/server'

import { submitQuest } from '@/lib/quests/service'
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

export async function POST(request: Request, context: RouteContext) {
  const userId = getUserId(request)

  if (!userId) {
    return unauthorizedResponse()
  }

  const questId = context.params?.questId

  if (!questId) {
    return invalidQuestIdResponse()
  }

  let payloadText: string

  try {
    payloadText = await request.text()
  } catch {
    return invalidPayloadResponse()
  }

  if (!payloadText) {
    return invalidPayloadResponse()
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(payloadText)
  } catch {
    return invalidPayloadResponse()
  }

  const selectedOption = (parsed as Record<string, unknown>).selectedOption

  if (
    typeof selectedOption !== 'number' ||
    !Number.isInteger(selectedOption) ||
    selectedOption < 1 ||
    selectedOption > 5
  ) {
    return invalidPayloadResponse()
  }

  try {
    const result = await submitQuest({
      userId,
      questId,
      selectedOption: selectedOption as number,
    })

    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    return mapQuestServiceError(error)
  }
}
