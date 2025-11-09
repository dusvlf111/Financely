import { describe, expect, it } from '@jest/globals'
import { DataType, IMemoryDb, newDb } from 'pg-mem'
import type { Pool } from 'pg'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

import { seedQuestData } from '@/lib/quests/seed'

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

describe('seedQuestData', () => {
  const userId = '00000000-0000-0000-0000-00000000a0a0'

  it('inserts quests and related user progress records', async () => {
    const { db, pool } = createTestContext()

    try {
  const questId = '00000000-0000-0000-0000-000000000111'
      const startedAt = new Date('2025-01-01T09:00:00Z')
      const submittedAt = new Date('2025-01-01T09:01:05Z')

      const result = await seedQuestData(pool, {
        reset: true,
        quests: [
          {
            id: questId,
            title: 'Seeded Quest',
            description: 'Populate base data',
            type: 'daily',
            options: ['A', 'B', 'C', 'D', 'E'],
            correctOption: 2,
            reward: { gold: 200 },
            status: 'active',
            progress: [
              {
                userId,
                status: 'completed',
                attempts: 2,
                startedAt,
                submittedAt,
                isSuccess: true,
                selectedOption: 2,
                timeTakenSeconds: 65,
              },
            ],
          },
        ],
      })

      expect(result.questCount).toBe(1)
      expect(result.userQuestCount).toBe(1)
      expect(result.questIds).toContain(questId)

      const questRow = db.public.one(`
        SELECT title, reward->>'gold' AS gold, status
        FROM quests WHERE id = '${questId}'
      `)

      expect(questRow.title).toBe('Seeded Quest')
      expect(questRow.gold).toBe('200')
      expect(questRow.status).toBe('active')

      const userQuestRow = db.public.one(`
        SELECT status, attempts, is_success, selected_option
        FROM user_quests
        WHERE quest_id = '${questId}' AND user_id = '${userId}'
      `)

      expect(userQuestRow.status).toBe('completed')
      expect(userQuestRow.attempts).toBe(2)
      expect(userQuestRow.is_success).toBe(true)
      expect(userQuestRow.selected_option).toBe(2)
    } finally {
      await pool.end()
    }
  })

  it('updates existing quest entries when re-seeded without reset', async () => {
    const { db, pool } = createTestContext()

    try {
  const questId = '00000000-0000-0000-0000-000000000222'

      await seedQuestData(pool, {
        reset: true,
        quests: [
          {
            id: questId,
            title: 'Original Quest',
            description: 'First seed',
            type: 'weekly',
            options: ['A', 'B', 'C', 'D', 'E'],
            correctOption: 3,
            reward: { gold: 150 },
            status: 'active',
            progress: [
              {
                userId,
                status: 'in_progress',
                attempts: 1,
                selectedOption: null,
                isSuccess: false,
              },
            ],
          },
        ],
      })

      await seedQuestData(pool, {
        quests: [
          {
            id: questId,
            title: 'Updated Quest',
            description: 'Updated seed',
            type: 'weekly',
            options: ['A', 'B', 'C', 'D', 'E'],
            correctOption: 4,
            reward: { gold: 500 },
            status: 'active',
            progress: [
              {
                userId,
                status: 'failed',
                attempts: 3,
                selectedOption: 1,
                isSuccess: false,
                timeTakenSeconds: 90,
              },
            ],
          },
        ],
      })

      const questRow = db.public.one(`
        SELECT title, reward->>'gold' AS gold, correct_option
        FROM quests WHERE id = '${questId}'
      `)

      expect(questRow.title).toBe('Updated Quest')
      expect(questRow.gold).toBe('500')
      expect(questRow.correct_option).toBe(4)

      const userQuestRow = db.public.one(`
        SELECT status, attempts, selected_option
        FROM user_quests
        WHERE quest_id = '${questId}' AND user_id = '${userId}'
      `)

      expect(userQuestRow.status).toBe('failed')
      expect(userQuestRow.attempts).toBe(3)
      expect(userQuestRow.selected_option).toBe(1)
    } finally {
      await pool.end()
    }
  })
})
