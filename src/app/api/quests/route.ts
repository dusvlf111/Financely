import { NextResponse } from 'next/server'

import { listQuests } from '@/lib/quests/service'
import { getUserId, mapQuestServiceError, parseQuestTypeParam, unauthorizedResponse } from './utils'

export async function GET(request: Request) {
  const userId = getUserId(request)

  if (!userId) {
    return unauthorizedResponse()
  }

  const url = new URL(request.url)
  const parseResult = parseQuestTypeParam(url.searchParams.get('type'))

  if ('error' in parseResult) {
    return parseResult.error
  }

  try {
    const quests = await listQuests(userId, parseResult.filters)
    return NextResponse.json({ data: quests }, { status: 200 })
  } catch (err) {
    return mapQuestServiceError(err)
  }
}
