import { Pool, PoolClient } from 'pg'
import { getPool } from '@/lib/db/pool'

export type QuestType = 'daily' | 'weekly' | 'monthly' | 'premium' | 'event'
export type QuestStatus = 'idle' | 'active' | 'in_progress' | 'completed' | 'failed' | 'expired'

export interface QuestRecord {
  id: string
  title: string
  description: string | null
  type: QuestType
  time_limit_seconds: number
  attempts_allowed: number
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_option: number
  reward: Record<string, unknown> | null
  start_at: Date | null
  expire_at: Date | null
  status: QuestStatus
  metadata: Record<string, unknown> | null
}

export interface UserQuestRecord {
  id: string
  quest_id: string
  user_id: string
  status: QuestStatus
  started_at: Date
  submitted_at: Date | null
  time_taken_seconds: number | null
  selected_option: number | null
  is_success: boolean | null
  attempts: number
}

export interface QuestListItem {
  id: string
  title: string
  description: string | null
  type: QuestType
  status: QuestStatus
  reward: Record<string, unknown> | null
  progress: {
    status: QuestStatus
    remainingAttempts: number
    startedAt: string | null
    submittedAt: string | null
    isSuccess: boolean | null
  }
  timer: {
    limitSeconds: number
    expiresAt: string | null
    startsAt: string | null
  }
  options: string[]
}

export interface SubmissionResult {
  questId: string
  status: QuestStatus
  isSuccess: boolean
  timeTakenSeconds: number | null
  rewardIssued: boolean
}

export interface QuestFilters {
  type?: QuestType
}

function getRemainingAttempts(quest: QuestRecord, userQuest: UserQuestRecord | null): number {
  if (!userQuest) {
    return quest.attempts_allowed
  }

  return Math.max(quest.attempts_allowed - userQuest.attempts, 0)
}

function normalizeQuestRow(row: any): QuestListItem {
  const quest: QuestRecord = row
  const userQuest: UserQuestRecord | null = row.user_quest_id
    ? {
        id: row.user_quest_id,
        quest_id: row.quest_id,
        user_id: row.user_id,
        status: row.user_status,
        started_at: row.started_at,
        submitted_at: row.submitted_at,
        time_taken_seconds: row.time_taken_seconds,
        selected_option: row.selected_option,
        is_success: row.is_success,
        attempts: row.attempts,
      }
    : null

  return {
    id: quest.id,
    title: quest.title,
    description: quest.description,
    type: quest.type,
    status: quest.status,
    reward: quest.reward,
    options: [quest.option_a, quest.option_b, quest.option_c, quest.option_d, quest.option_e],
    progress: {
      status: userQuest?.status ?? 'idle',
      remainingAttempts: getRemainingAttempts(quest, userQuest),
      startedAt: userQuest?.started_at?.toISOString() ?? null,
      submittedAt: userQuest?.submitted_at?.toISOString() ?? null,
      isSuccess: userQuest?.is_success ?? null,
    },
    timer: {
      limitSeconds: quest.time_limit_seconds,
      expiresAt: quest.expire_at?.toISOString() ?? null,
      startsAt: quest.start_at?.toISOString() ?? null,
    },
  }
}

async function withTransaction<T>(pool: Pool, callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function listQuests(
  userId: string,
  filters: QuestFilters = {},
  pool: Pool = getPool()
): Promise<QuestListItem[]> {
  const client = await pool.connect()

  try {
    const conditions: string[] = []
    const params: any[] = [userId]

    conditions.push('(q.start_at IS NULL OR q.start_at <= now())')
    conditions.push('(q.expire_at IS NULL OR q.expire_at > now())')

    if (filters.type) {
      params.push(filters.type)
      conditions.push(`q.type = $${params.length}`)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT
        q.*,
        uq.id AS user_quest_id,
        uq.quest_id,
        uq.user_id,
        uq.status AS user_status,
        uq.started_at,
        uq.submitted_at,
        uq.time_taken_seconds,
        uq.selected_option,
        uq.is_success,
        uq.attempts
      FROM quests q
      LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = $1
      ${whereClause}
      ORDER BY q.type, q.created_at DESC
    `

    const { rows } = await client.query(query, params)
    return rows.map(normalizeQuestRow)
  } finally {
    client.release()
  }
}

interface StartQuestOptions {
  userId: string
  questId: string
  pool?: Pool
}

export async function startQuest({ userId, questId, pool = getPool() }: StartQuestOptions) {
  return withTransaction(pool, async (client) => {
    const questResult = await client.query<QuestRecord>(
      `SELECT * FROM quests WHERE id = $1 FOR UPDATE`,
      [questId]
    )

    if ((questResult.rowCount ?? 0) === 0) {
      throw new Error('QUEST_NOT_FOUND')
    }

    const quest = questResult.rows[0]

    if (quest.start_at && quest.start_at > new Date()) {
      throw new Error('QUEST_NOT_AVAILABLE_YET')
    }

    if (quest.expire_at && quest.expire_at <= new Date()) {
      throw new Error('QUEST_EXPIRED')
    }

    const userQuestResult = await client.query<UserQuestRecord>(
      `SELECT * FROM user_quests WHERE quest_id = $1 AND user_id = $2 FOR UPDATE`,
      [questId, userId]
    )

    if ((userQuestResult.rowCount ?? 0) > 0) {
      const userQuest = userQuestResult.rows[0]

      if (userQuest.status === 'completed') {
        throw new Error('QUEST_ALREADY_COMPLETED')
      }

      if (userQuest.status === 'in_progress') {
        throw new Error('QUEST_ALREADY_IN_PROGRESS')
      }

      if (userQuest.status === 'failed' && userQuest.attempts >= quest.attempts_allowed) {
        throw new Error('QUEST_ATTEMPTS_EXHAUSTED')
      }
    }

    const insertResult = await client.query<UserQuestRecord>(
      `
        INSERT INTO user_quests (quest_id, user_id, status, started_at, attempts)
        VALUES ($1, $2, 'in_progress', now(), 1)
        ON CONFLICT (quest_id, user_id)
        DO UPDATE
        SET status = 'in_progress', started_at = now(), attempts = user_quests.attempts + 1
        WHERE user_quests.status <> 'completed'
        RETURNING *
      `,
      [questId, userId]
    )

    if ((insertResult.rowCount ?? 0) === 0) {
      throw new Error('QUEST_START_FAILED')
    }

    const userQuest = insertResult.rows[0]

    if (userQuest.attempts > quest.attempts_allowed) {
      throw new Error('QUEST_ATTEMPTS_EXHAUSTED')
    }

    return {
      questId: quest.id,
      status: userQuest.status,
      attempts: userQuest.attempts,
      startedAt: userQuest.started_at.toISOString(),
      timeLimitSeconds: quest.time_limit_seconds,
      expiresAt: quest.expire_at?.toISOString() ?? null,
    }
  })
}

interface SubmitQuestOptions {
  userId: string
  questId: string
  selectedOption: number
  pool?: Pool
}

export async function submitQuest({ userId, questId, selectedOption, pool = getPool() }: SubmitQuestOptions) {
  return withTransaction(pool, async (client) => {
    const questResult = await client.query<QuestRecord>(
      `SELECT * FROM quests WHERE id = $1 FOR UPDATE`,
      [questId]
    )

    if ((questResult.rowCount ?? 0) === 0) {
      throw new Error('QUEST_NOT_FOUND')
    }

    const quest = questResult.rows[0]

    const userQuestResult = await client.query<UserQuestRecord>(
      `SELECT * FROM user_quests WHERE quest_id = $1 AND user_id = $2 FOR UPDATE`,
      [questId, userId]
    )

    if ((userQuestResult.rowCount ?? 0) === 0) {
      throw new Error('QUEST_NOT_STARTED')
    }

    const userQuest = userQuestResult.rows[0]

    if (userQuest.status !== 'in_progress') {
      throw new Error('QUEST_NOT_IN_PROGRESS')
    }

    const elapsedMs = Date.now() - new Date(userQuest.started_at).getTime()
    const timeTakenSeconds = Math.floor(elapsedMs / 1000)

    if (quest.time_limit_seconds && timeTakenSeconds > quest.time_limit_seconds) {
      await client.query(
        `
          UPDATE user_quests
          SET status = 'failed', submitted_at = now(), time_taken_seconds = $3, selected_option = $4, is_success = false
          WHERE id = $1 AND user_id = $2
        `,
        [userQuest.id, userId, timeTakenSeconds, selectedOption]
      )

      return {
        questId: quest.id,
        status: 'failed' as QuestStatus,
        isSuccess: false,
        timeTakenSeconds,
        rewardIssued: false,
      }
    }

    const isSuccess = quest.correct_option === selectedOption

    const updated = await client.query<UserQuestRecord>(
      `
        UPDATE user_quests
        SET status = $4,
            submitted_at = now(),
            time_taken_seconds = $5,
            selected_option = $6,
            is_success = $7
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `,
      [userQuest.id, userId, selectedOption, isSuccess ? 'completed' : 'failed', timeTakenSeconds, selectedOption, isSuccess]
    )

    if ((updated.rowCount ?? 0) === 0) {
      throw new Error('QUEST_SUBMIT_FAILED')
    }

    const updatedQuest = updated.rows[0]

    let rewardIssued = false

    if (isSuccess && quest.reward) {
      await client.query(
        `
          INSERT INTO quest_rewards (user_quest_id, user_id, reward, issued, issued_at)
          VALUES ($1, $2, $3, false, NULL)
          ON CONFLICT DO NOTHING
        `,
        [updatedQuest.id, userId, quest.reward]
      )
      rewardIssued = true
    }

    return {
      questId: quest.id,
      status: updatedQuest.status,
      isSuccess,
      timeTakenSeconds,
      rewardIssued,
    }
  })
}

interface FailQuestOptions {
  userId: string
  questId: string
  reason?: 'timeout' | 'manual'
  pool?: Pool
}

export async function failQuest({ userId, questId, reason = 'manual', pool = getPool() }: FailQuestOptions) {
  return withTransaction(pool, async (client) => {
    const userQuestResult = await client.query<UserQuestRecord>(
      `SELECT * FROM user_quests WHERE quest_id = $1 AND user_id = $2 FOR UPDATE`,
      [questId, userId]
    )

    if ((userQuestResult.rowCount ?? 0) === 0) {
      throw new Error('QUEST_NOT_STARTED')
    }

    const userQuest = userQuestResult.rows[0]

    if (userQuest.status !== 'in_progress') {
      throw new Error('QUEST_NOT_IN_PROGRESS')
    }

    const timeTakenSeconds = userQuest.started_at
      ? Math.floor((Date.now() - new Date(userQuest.started_at).getTime()) / 1000)
      : null

    const updated = await client.query<UserQuestRecord>(
      `
        UPDATE user_quests
        SET status = 'failed',
            submitted_at = now(),
            is_success = false,
            selected_option = NULL,
            time_taken_seconds = $3
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `,
      [userQuest.id, userId, timeTakenSeconds]
    )

    if ((updated.rowCount ?? 0) === 0) {
      throw new Error('QUEST_FAIL_UPDATE_FAILED')
    }

    const updatedQuest = updated.rows[0]

    return {
      questId,
      status: updatedQuest.status,
      isSuccess: false,
      reason,
    }
  })
}
