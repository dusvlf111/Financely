import { describe, expect, it } from '@jest/globals'
import { newDb, IMemoryDb, DataType } from 'pg-mem'
import type { Pool } from 'pg'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

import { listQuests, startQuest, submitQuest, failQuest } from '../src/lib/quests/service'

type StartQuestResult = Awaited<ReturnType<typeof startQuest>>

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '000_create_quest_tables.sql')

const sanitizeSqlForPgMem = (sql: string) =>
  sql
    .replace(/CREATE EXTENSION[^;]+;/gi, '')
    .replace(/CREATE OR REPLACE FUNCTION[\s\S]+?LANGUAGE 'plpgsql';/gi, '')
    .replace(/CREATE TRIGGER[\s\S]+?;/gi, '')

const rawMigrationSql = fs.readFileSync(migrationPath, 'utf8')
const sanitizedMigrationSql = sanitizeSqlForPgMem(rawMigrationSql)

interface TestContext {
  db: IMemoryDb
  pool: Pool
}

function createTestContext(): TestContext {
  const db = newDb({ autoCreateForeignKeyIndices: true })

  db.public.registerFunction({
    name: 'uuid_generate_v4',
    returns: DataType.uuid,
    implementation: () => randomUUID(),
  })

  db.public.none(sanitizedMigrationSql)

  const adapter = db.adapters.createPg()
  const pool = new adapter.Pool() as unknown as Pool

  return { db, pool }
}

describe('quest service', () => {
  const userId = '00000000-0000-0000-0000-00000000feed'

  it('lists active quests with normalized payloads', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000101'

      db.public.none(`
        INSERT INTO quests (
          id, title, description, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, reward, start_at, expire_at, status
        ) VALUES (
          '${questId}', 'Daily Quest', 'Answer the question', 'daily',
          60, 1,
          'A1', 'B1', 'C1', 'D1', 'E1',
          1, '{"gold": 100}'::jsonb, now() - interval '1 hour', now() + interval '1 day', 'active'
        )
      `)

      const quests = await listQuests(userId, {}, pool)

      expect(quests).toHaveLength(1)

      const quest = quests[0]
      expect(quest.id).toBe(questId)
      expect(quest.options).toEqual(['A1', 'B1', 'C1', 'D1', 'E1'])
      expect(quest.progress.status).toBe('idle')
      expect(quest.progress.remainingAttempts).toBe(1)
      expect(quest.timer.limitSeconds).toBe(60)
      expect(quest.timer.expiresAt).not.toBeNull()
      expect(quest.timer.startsAt).not.toBeNull()
      expect(quest.reward).toEqual({ gold: 100 })
    } finally {
      await pool.end()
    }
  })

  it('includes user quest progress details when a user record exists', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000111'

      db.public.none(`
        INSERT INTO quests (
          id, title, description, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, reward, start_at, expire_at, status
        ) VALUES (
          '${questId}', 'Tracked Quest', 'Keep progress data', 'weekly',
          180, 3,
          'A', 'B', 'C', 'D', 'E',
          4, '{"badge": "silver"}'::jsonb, now() - interval '2 hours', now() + interval '2 days', 'active'
        )
      `)

      await startQuest({ userId, questId, pool })

      db.public.none(`
        UPDATE user_quests
        SET status = 'in_progress', attempts = 2, started_at = now() - interval '30 seconds'
        WHERE quest_id = '${questId}' AND user_id = '${userId}'
      `)

      const [quest] = await listQuests(userId, { type: 'weekly' }, pool)

      expect(quest.progress.status).toBe('in_progress')
      expect(quest.progress.remainingAttempts).toBe(1)
      expect(quest.progress.startedAt).not.toBeNull()
      expect(quest.options).toHaveLength(5)
      expect(quest.reward).toEqual({ badge: 'silver' })
    } finally {
      await pool.end()
    }
  })

  it('starts a quest once and blocks duplicate in-progress attempts', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000202'

      db.public.none(`
        INSERT INTO quests (
          id, title, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, status
        ) VALUES (
          '${questId}', 'Start Quest', 'daily',
          90, 2,
          'A', 'B', 'C', 'D', 'E',
          1, 'active'
        )
      `)

      const result = await startQuest({ userId, questId, pool })
      expect(result.status).toBe('in_progress')
      expect(result.attempts).toBe(1)

      await expect(startQuest({ userId, questId, pool })).rejects.toThrow('QUEST_ALREADY_IN_PROGRESS')
    } finally {
      await pool.end()
    }
  })

  it('increments attempts and enforces attempt exhaustion rules', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000303'

      db.public.none(`
        INSERT INTO quests (
          id, title, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, status
        ) VALUES (
          '${questId}', 'Attempts Quest', 'daily',
          30, 2,
          'A', 'B', 'C', 'D', 'E',
          1, 'active'
        )
      `)

      const first = await startQuest({ userId, questId, pool })
      expect(first.attempts).toBe(1)

      db.public.none(`
        UPDATE user_quests
        SET status = 'failed', submitted_at = now(), attempts = 1
        WHERE quest_id = '${questId}' AND user_id = '${userId}'
      `)

      const second = await startQuest({ userId, questId, pool })
      expect(second.attempts).toBe(2)

      db.public.none(`
        UPDATE user_quests
        SET status = 'failed', attempts = 2
        WHERE quest_id = '${questId}' AND user_id = '${userId}'
      `)

      await expect(startQuest({ userId, questId, pool })).rejects.toThrow('QUEST_ATTEMPTS_EXHAUSTED')
    } finally {
      await pool.end()
    }
  })

  it('submits a successful quest and records a pending reward', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000404'

      db.public.none(`
        INSERT INTO quests (
          id, title, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, reward, status
        ) VALUES (
          '${questId}', 'Submit Quest', 'daily',
          120, 1,
          'A', 'B', 'C', 'D', 'E',
          2, '{"xp": 200}'::jsonb, 'active'
        )
      `)

      await startQuest({ userId, questId, pool })

      const submission = await submitQuest({ userId, questId, selectedOption: 2, pool })
      expect(submission.status).toBe('completed')
      expect(submission.isSuccess).toBe(true)
      expect(submission.rewardIssued).toBe(true)

      const reward = db.public.one(`
        SELECT COUNT(*)::int AS count
        FROM quest_rewards
        WHERE user_id = '${userId}' AND user_quest_id IS NOT NULL
      `)

      expect(reward.count).toBe(1)
    } finally {
      await pool.end()
    }
  })

  it('fails a submission with an incorrect answer without issuing rewards', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000505'

      db.public.none(`
        INSERT INTO quests (
          id, title, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, reward, status
        ) VALUES (
          '${questId}', 'Wrong Answer Quest', 'daily',
          45, 1,
          'A', 'B', 'C', 'D', 'E',
          3, '{"gold": 10}'::jsonb, 'active'
        )
      `)

      await startQuest({ userId, questId, pool })

      const submission = await submitQuest({ userId, questId, selectedOption: 1, pool })
      expect(submission.status).toBe('failed')
      expect(submission.isSuccess).toBe(false)
      expect(submission.rewardIssued).toBe(false)

      const rewardCount = db.public.one(`
        SELECT COUNT(*)::int AS count
        FROM quest_rewards
        WHERE user_id = '${userId}'
      `)

      expect(rewardCount.count).toBe(0)
    } finally {
      await pool.end()
    }
  })

  it('marks a quest as failed when time limit is exceeded', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000606'

      db.public.none(`
        INSERT INTO quests (
          id, title, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, reward, status
        ) VALUES (
          '${questId}', 'Timeout Quest', 'daily',
          30, 1,
          'A', 'B', 'C', 'D', 'E',
          1, '{"gold": 25}'::jsonb, 'active'
        )
      `)

      await startQuest({ userId, questId, pool })

      db.public.none(`
        UPDATE user_quests
        SET started_at = now() - interval '65 seconds'
        WHERE quest_id = '${questId}' AND user_id = '${userId}'
      `)

      const submission = await submitQuest({ userId, questId, selectedOption: 1, pool })
      expect(submission.status).toBe('failed')
      expect(submission.isSuccess).toBe(false)
      expect(submission.rewardIssued).toBe(false)
      expect(submission.timeTakenSeconds).toBeGreaterThan(30)
    } finally {
      await pool.end()
    }
  })

  it('allows manual failure updates through failQuest', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000707'

      db.public.none(`
        INSERT INTO quests (
          id, title, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, status
        ) VALUES (
          '${questId}', 'Manual Fail Quest', 'daily',
          75, 1,
          'A', 'B', 'C', 'D', 'E',
          4, 'active'
        )
      `)

      await startQuest({ userId, questId, pool })

      const failure = await failQuest({ userId, questId, reason: 'timeout', pool })
      expect(failure.status).toBe('failed')
      expect(failure.isSuccess).toBe(false)
      expect(failure.reason).toBe('timeout')

      const questRow = db.public.one(`
        SELECT status
        FROM user_quests
        WHERE quest_id = '${questId}' AND user_id = '${userId}'
      `)

      expect(questRow.status).toBe('failed')
    } finally {
      await pool.end()
    }
  })

  it('permits only one concurrent startQuest call to succeed', async () => {
    const { db, pool } = createTestContext()

    try {
      const questId = '00000000-0000-0000-0000-000000000808'

      db.public.none(`
        INSERT INTO quests (
          id, title, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, status
        ) VALUES (
          '${questId}', 'Concurrent Quest', 'daily',
          45, 1,
          'A', 'B', 'C', 'D', 'E',
          5, 'active'
        )
      `)

      const results = await Promise.allSettled([
        startQuest({ userId, questId, pool }),
        startQuest({ userId, questId, pool }),
      ])

      const fulfilled = results.find(
        (result): result is PromiseFulfilledResult<StartQuestResult> => result.status === 'fulfilled'
      )
      const rejected = results.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      )

      expect(fulfilled).toBeDefined()
      expect(fulfilled?.value.status).toBe('in_progress')

      expect(rejected).toBeDefined()
      expect(rejected?.reason).toBeInstanceOf(Error)
      expect(['QUEST_ALREADY_IN_PROGRESS', 'QUEST_ATTEMPTS_EXHAUSTED']).toContain(
        (rejected?.reason as Error).message
      )
    } finally {
      await pool.end()
    }
  })
})
