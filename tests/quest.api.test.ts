import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { DataType, IMemoryDb, newDb } from 'pg-mem'
import type { Pool } from 'pg'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

import { setPool } from '@/lib/db/pool'
import { GET as listHandler } from '@/app/api/quests/route'
import { POST as startHandler } from '@/app/api/quests/[questId]/start/route'
import { POST as submitHandler } from '@/app/api/quests/[questId]/submit/route'
import { POST as failHandler } from '@/app/api/quests/[questId]/fail/route'

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

const userId = '00000000-0000-0000-0000-00000000feed'

const withUserHeaders = (headers?: HeadersInit): HeadersInit => {
  const nextHeaders = new Headers(headers)
  nextHeaders.set('x-user-id', userId)
  return nextHeaders
}

const createRequest = (url: string, init?: RequestInit) => new Request(url, init)

const withParams = (questId: string) => ({ params: Promise.resolve({ questId }) })

describe('quest API routes', () => {
  let context: TestContext

  beforeEach(() => {
    context = createTestContext()
    setPool(context.pool)
  })

  afterEach(async () => {
    await context.pool.end()
    setPool(null)
  })

  it('lists quests for the authenticated user', async () => {
    const questId = '00000000-0000-0000-0000-000000000901'

    context.db.public.none(`
      INSERT INTO quests (
        id, title, description, type, time_limit_seconds, attempts_allowed,
        option_a, option_b, option_c, option_d, option_e,
        correct_option, reward, start_at, expire_at, status
      ) VALUES (
        '${questId}', 'API Quest', 'List via API', 'daily', 60, 1,
        'A', 'B', 'C', 'D', 'E',
        2, '{"gold": 25}'::jsonb, now() - interval '1 hour', now() + interval '1 day', 'active'
      )
    `)

    const response = await listHandler(
      createRequest('http://localhost/api/quests', {
        headers: withUserHeaders(),
      })
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data[0].id).toBe(questId)
  })

  it('requires authentication headers for quest listing', async () => {
    const response = await listHandler(createRequest('http://localhost/api/quests'))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('starts a quest and returns the progress payload', async () => {
    const questId = '00000000-0000-0000-0000-000000000a01'

    context.db.public.none(`
      INSERT INTO quests (
        id, title, type, time_limit_seconds, attempts_allowed,
        option_a, option_b, option_c, option_d, option_e,
        correct_option, start_at, expire_at, status
      ) VALUES (
        '${questId}', 'Start Quest', 'daily',
        120, 2,
        'A', 'B', 'C', 'D', 'E',
        1, now() - interval '1 hour', now() + interval '1 day', 'active'
      )
    `)

    const response = await startHandler(
      createRequest(`http://localhost/api/quests/${questId}/start`, {
        method: 'POST',
        headers: withUserHeaders(),
      }),
      withParams(questId)
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.status).toBe('in_progress')
    expect(body.data.attempts).toBe(1)

    const record = context.db.public.one(`
      SELECT status, attempts FROM user_quests WHERE quest_id = '${questId}' AND user_id = '${userId}'
    `)

    expect(record.status).toBe('in_progress')
    expect(record.attempts).toBe(1)
  })

  it('submits a correct answer and enqueues reward issuance', async () => {
    const questId = '00000000-0000-0000-0000-000000000a02'

    context.db.public.none(`
      INSERT INTO quests (
        id, title, type, time_limit_seconds, attempts_allowed,
        option_a, option_b, option_c, option_d, option_e,
        correct_option, reward, start_at, expire_at, status
      ) VALUES (
        '${questId}', 'Submit Quest', 'daily',
        45, 1,
        'A', 'B', 'C', 'D', 'E',
        3, '{"xp": 200}'::jsonb, now() - interval '1 hour', now() + interval '1 day', 'active'
      )
    `)

    await startHandler(
      createRequest(`http://localhost/api/quests/${questId}/start`, {
        method: 'POST',
        headers: withUserHeaders(),
      }),
      withParams(questId)
    )

    const response = await submitHandler(
      createRequest(`http://localhost/api/quests/${questId}/submit`, {
        method: 'POST',
        headers: withUserHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({ selectedOption: 3 }),
      }),
      withParams(questId)
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.isSuccess).toBe(true)
    expect(body.data.rewardIssued).toBe(true)

    const rewards = context.db.public.one(`
      SELECT COUNT(*)::int AS count
      FROM quest_rewards
      WHERE user_id = '${userId}'
    `)

    expect(rewards.count).toBe(1)
  })

  it('validates submit payload', async () => {
    const questId = '00000000-0000-0000-0000-000000000a03'

    context.db.public.none(`
      INSERT INTO quests (
        id, title, type, time_limit_seconds, attempts_allowed,
        option_a, option_b, option_c, option_d, option_e,
        correct_option, reward, start_at, expire_at, status
      ) VALUES (
        '${questId}', 'Validation Quest', 'daily',
        45, 1,
        'A', 'B', 'C', 'D', 'E',
        5, '{"xp": 10}'::jsonb, now() - interval '1 hour', now() + interval '1 day', 'active'
      )
    `)

    await startHandler(
      createRequest(`http://localhost/api/quests/${questId}/start`, {
        method: 'POST',
        headers: withUserHeaders(),
      }),
      withParams(questId)
    )

    const response = await submitHandler(
      createRequest(`http://localhost/api/quests/${questId}/submit`, {
        method: 'POST',
        headers: withUserHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({}),
      }),
      withParams(questId)
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error.code).toBe('INVALID_PAYLOAD')
  })

  it('marks a quest as failed through the API', async () => {
    const questId = '00000000-0000-0000-0000-000000000a04'

    context.db.public.none(`
      INSERT INTO quests (
        id, title, type, time_limit_seconds, attempts_allowed,
        option_a, option_b, option_c, option_d, option_e,
        correct_option, start_at, expire_at, status
      ) VALUES (
        '${questId}', 'Fail Quest', 'daily',
        60, 2,
        'A', 'B', 'C', 'D', 'E',
        2, now() - interval '1 hour', now() + interval '1 day', 'active'
      )
    `)

    await startHandler(
      createRequest(`http://localhost/api/quests/${questId}/start`, {
        method: 'POST',
        headers: withUserHeaders(),
      }),
      withParams(questId)
    )

    const response = await failHandler(
      createRequest(`http://localhost/api/quests/${questId}/fail`, {
        method: 'POST',
        headers: withUserHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({ reason: 'timeout' }),
      }),
      withParams(questId)
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.status).toBe('failed')
    expect(body.data.reason).toBe('timeout')

    const record = context.db.public.one(`
      SELECT status FROM user_quests WHERE quest_id = '${questId}' AND user_id = '${userId}'
    `)

    expect(record.status).toBe('failed')
  })

  it('enforces timer limit even if a client submits after the deadline', async () => {
    const questId = '00000000-0000-0000-0000-000000000a05'

    context.db.public.none(`
      INSERT INTO quests (
        id, title, type, time_limit_seconds, attempts_allowed,
        option_a, option_b, option_c, option_d, option_e,
        correct_option, start_at, expire_at, status
      ) VALUES (
        '${questId}', 'Timer Guard Quest', 'daily',
        30, 1,
        'A', 'B', 'C', 'D', 'E',
        1, now() - interval '10 minutes', now() + interval '1 day', 'active'
      )
    `)

    await startHandler(
      createRequest(`http://localhost/api/quests/${questId}/start`, {
        method: 'POST',
        headers: withUserHeaders(),
      }),
      withParams(questId)
    )

    context.db.public.none(`
      UPDATE user_quests
      SET started_at = now() - interval '90 seconds'
      WHERE quest_id = '${questId}' AND user_id = '${userId}'
    `)

    const response = await submitHandler(
      createRequest(`http://localhost/api/quests/${questId}/submit`, {
        method: 'POST',
        headers: withUserHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({ selectedOption: 1 }),
      }),
      withParams(questId)
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.status).toBe('failed')
    expect(body.data.isSuccess).toBe(false)
    expect(body.data.rewardIssued).toBe(false)
    expect(body.data.timeTakenSeconds).toBeGreaterThan(30)
  })

  it('blocks duplicate submissions and prevents reward duplication', async () => {
    const questId = '00000000-0000-0000-0000-000000000a06'

    context.db.public.none(`
      INSERT INTO quests (
        id, title, type, time_limit_seconds, attempts_allowed,
        option_a, option_b, option_c, option_d, option_e,
        correct_option, reward, start_at, expire_at, status
      ) VALUES (
        '${questId}', 'Duplicate Submission Quest', 'daily',
        120, 1,
        'A', 'B', 'C', 'D', 'E',
        2, '{"gold": 50}'::jsonb, now() - interval '5 minutes', now() + interval '1 day', 'active'
      )
    `)

    await startHandler(
      createRequest(`http://localhost/api/quests/${questId}/start`, {
        method: 'POST',
        headers: withUserHeaders(),
      }),
      withParams(questId)
    )

    const first = await submitHandler(
      createRequest(`http://localhost/api/quests/${questId}/submit`, {
        method: 'POST',
        headers: withUserHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({ selectedOption: 2 }),
      }),
      withParams(questId)
    )

    expect(first.status).toBe(200)

    const duplicate = await submitHandler(
      createRequest(`http://localhost/api/quests/${questId}/submit`, {
        method: 'POST',
        headers: withUserHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({ selectedOption: 2 }),
      }),
      withParams(questId)
    )

    expect(duplicate.status).toBe(409)
    const duplicateBody = await duplicate.json()
    expect(duplicateBody.error.code).toBe('QUEST_NOT_IN_PROGRESS')

    const rewardCount = context.db.public.one(`
      SELECT COUNT(*)::int AS count
      FROM quest_rewards
      WHERE user_id = '${userId}'
    `)

    expect(rewardCount.count).toBe(1)
  })
})

describe('quest API fallback without database', () => {
  beforeEach(() => {
    setPool(null)
    delete process.env.SUPABASE_DB_URL
    delete process.env.DATABASE_URL
    delete process.env.POSTGRES_URL
  })

  it('returns seed quests when no database connection is configured', async () => {
    const response = await listHandler(
      createRequest('http://localhost/api/quests', {
        headers: withUserHeaders(),
      })
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toMatchObject({
      progress: expect.any(Object),
      timer: expect.any(Object),
    })
  })
})
