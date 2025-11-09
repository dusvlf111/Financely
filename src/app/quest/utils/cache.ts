import type { QuestListItem } from '@/lib/quests/service'

const QUEST_CACHE_KEY = 'financely.questCache.v1'
const QUEST_CACHE_TTL = 1000 * 60 * 5 // 5 minutes

interface QuestCacheEntry {
  data: QuestListItem[]
  updatedAt: number
}

type QuestCacheStore = Record<string, QuestCacheEntry>

export function loadCachedQuests(userId: string): QuestCacheEntry | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(QUEST_CACHE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as QuestCacheStore
    const entry = parsed[userId]
    if (!entry) {
      return null
    }

    if (Date.now() - entry.updatedAt > QUEST_CACHE_TTL) {
      return null
    }

    return entry
  } catch {
    return null
  }
}

export function saveCachedQuests(userId: string, data: QuestListItem[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const raw = window.sessionStorage.getItem(QUEST_CACHE_KEY)
    const parsed = raw ? (JSON.parse(raw) as QuestCacheStore) : {}
    parsed[userId] = {
      data,
      updatedAt: Date.now(),
    }
    window.sessionStorage.setItem(QUEST_CACHE_KEY, JSON.stringify(parsed))
  } catch {
    // ignore cache failures
  }
}
