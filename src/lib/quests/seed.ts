import { randomUUID } from 'crypto'
import type { Pool } from 'pg'
import type { QuestStatus, QuestType } from '@/lib/quests/service'

export interface QuestProgressSeed {
  userId: string
  status?: QuestStatus
  attempts?: number
  startedAt?: Date
  submittedAt?: Date | null
  isSuccess?: boolean | null
  selectedOption?: number | null
  timeTakenSeconds?: number | null
}

export interface QuestSeed {
  id?: string
  title: string
  description?: string | null
  type: QuestType
  options: [string, string, string, string, string]
  correctOption: number
  reward?: Record<string, unknown> | null
  timeLimitSeconds?: number
  attemptsAllowed?: number
  startAt?: Date | null
  expireAt?: Date | null
  status?: QuestStatus
  metadata?: Record<string, unknown> | null
  progress?: QuestProgressSeed[]
}

export interface SeedQuestDataOptions {
  quests?: QuestSeed[]
  reset?: boolean
}

export interface SeedQuestDataResult {
  questCount: number
  userQuestCount: number
  questIds: string[]
}

export const DEFAULT_QUEST_SEEDS: QuestSeed[] = [
  {
    title: '예산 다이어트 챌린지',
    description: '하루 지출을 20% 줄여보세요.',
    type: 'daily',
    options: ['절약 항목 확인', '적금 들기', '보험 가입', '주식 투자', '신용카드 발급'],
    correctOption: 1,
    reward: { gold: 120 },
    status: 'active',
  },
  {
    title: '주간 저축 미션',
    description: '일주일간 3회 이상 저축에 성공하세요.',
    type: 'weekly',
    options: ['투자 계좌 이동', '비상금 채우기', '적금 추가납입', '보험료 인상', '구독 서비스 추가'],
    correctOption: 2,
    reward: { gold: 300, badge: 'saver' },
    status: 'active',
  },
  {
    title: '깜짝 퀘스트: 옵션 합성 전략',
    description: '다음 중 옵션 합성 전략이 아닌 것은 무엇일까요?',
    type: 'event',
    options: ['Protective Put', 'Covered Call', 'Straddle', 'Martingale Strategy', 'Butterfly Spread'],
    correctOption: 4,
    reward: { type: 'stock_entry', symbol: 'TSLA', label: '테슬라 주식 응모권', quantity: 1, limited: 50 },
    timeLimitSeconds: 5,
    attemptsAllowed: 1,
    status: 'active',
    metadata: {
      badge: '깜짝!',
      details: '선착순 50명 보상 지급',
    },
  },
]

function ensureOptionsLength(options: QuestSeed['options']): void {
  if (options.length !== 5) {
    throw new Error('Quest options must contain exactly five entries.')
  }
}

export async function seedQuestData(
  pool: Pool,
  { quests = DEFAULT_QUEST_SEEDS, reset = false }: SeedQuestDataOptions = {}
): Promise<SeedQuestDataResult> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (reset) {
      try {
        await client.query('TRUNCATE quest_rewards, user_quests, quests RESTART IDENTITY CASCADE')
      } catch {
        // pg-mem (used in tests) does not support multi-table truncation; fall back to delete
        await client.query('DELETE FROM quest_rewards')
        await client.query('DELETE FROM user_quests')
        await client.query('DELETE FROM quests')
      }
    }

    const questIds: string[] = []
    let userQuestCount = 0

    for (const quest of quests) {
      ensureOptionsLength(quest.options)

      const questId = quest.id ?? randomUUID()
      const questValues = [
        questId,
        quest.title,
        quest.description ?? null,
        quest.type,
        quest.timeLimitSeconds ?? 60,
        quest.attemptsAllowed ?? 1,
        quest.options[0],
        quest.options[1],
        quest.options[2],
        quest.options[3],
        quest.options[4],
        quest.correctOption,
        quest.reward ?? null,
        quest.startAt ?? null,
        quest.expireAt ?? null,
        quest.status ?? 'active',
        quest.metadata ?? null,
      ]

      await client.query(
        `
          INSERT INTO quests (
            id, title, description, type,
            time_limit_seconds, attempts_allowed,
            option_a, option_b, option_c, option_d, option_e,
            correct_option, reward, start_at, expire_at, status, metadata
          )
          VALUES (
            $1, $2, $3, $4,
            $5, $6,
            $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17
          )
          ON CONFLICT (id) DO UPDATE
          SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            type = EXCLUDED.type,
            time_limit_seconds = EXCLUDED.time_limit_seconds,
            attempts_allowed = EXCLUDED.attempts_allowed,
            option_a = EXCLUDED.option_a,
            option_b = EXCLUDED.option_b,
            option_c = EXCLUDED.option_c,
            option_d = EXCLUDED.option_d,
            option_e = EXCLUDED.option_e,
            correct_option = EXCLUDED.correct_option,
            reward = EXCLUDED.reward,
            start_at = EXCLUDED.start_at,
            expire_at = EXCLUDED.expire_at,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata
        `,
        questValues
      )

      questIds.push(questId)

      if (quest.progress?.length) {
        for (const progress of quest.progress) {
          const progressValues = [
            questId,
            progress.userId,
            progress.status ?? 'in_progress',
            progress.startedAt ?? new Date(),
            progress.submittedAt ?? null,
            progress.timeTakenSeconds ?? null,
            progress.selectedOption ?? null,
            progress.isSuccess ?? false,
            progress.attempts ?? 1,
          ]

          await client.query(
            `
              INSERT INTO user_quests (
                quest_id, user_id, status, started_at, submitted_at,
                time_taken_seconds, selected_option, is_success, attempts
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (quest_id, user_id) DO UPDATE
              SET
                status = EXCLUDED.status,
                started_at = EXCLUDED.started_at,
                submitted_at = EXCLUDED.submitted_at,
                time_taken_seconds = EXCLUDED.time_taken_seconds,
                selected_option = EXCLUDED.selected_option,
                is_success = EXCLUDED.is_success,
                attempts = EXCLUDED.attempts
            `,
            progressValues
          )

          userQuestCount += 1
        }
      }
    }

    await client.query('COMMIT')

    return {
      questCount: quests.length,
      userQuestCount,
      questIds,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
