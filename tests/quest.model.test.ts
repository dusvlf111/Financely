import { beforeAll, describe, expect, it } from '@jest/globals';
import { newDb, IMemoryDb, DataType } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '000_create_quest_tables.sql');

const sanitizeSqlForPgMem = (sql: string) =>
  sql
    .replace(/CREATE EXTENSION[^;]+;/gi, '')
    .replace(/CREATE OR REPLACE FUNCTION[\s\S]+?LANGUAGE 'plpgsql';/gi, '')
    .replace(/CREATE TRIGGER[\s\S]+?;/gi, '');

describe('Quest model / DB migrations', () => {
  let db: IMemoryDb;

  beforeAll(() => {
    if (!fs.existsSync(migrationPath)) {
      throw new Error('Migration file missing: 000_create_quest_tables.sql');
    }

    const rawSql = fs.readFileSync(migrationPath, 'utf8');
    const sanitizedSql = sanitizeSqlForPgMem(rawSql);

    db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: () => randomUUID(),
    });
    db.public.none(sanitizedSql);
  });

  it('inserts a valid quest with 5 options and default attempts/status', () => {
    const questId = '00000000-0000-0000-0000-000000000001';
    const row = db.public.one(
      `
        INSERT INTO quests (
          id, title, description, type,
          time_limit_seconds, attempts_allowed,
          option_a, option_b, option_c, option_d, option_e,
          correct_option, reward, start_at, expire_at
        ) VALUES (
          '${questId}', 'Sample Quest', 'Solve finance problem', 'daily',
          45, 1,
          'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5',
          3, '{"xp": 100}', now(), now() + interval '1 day'
        )
        RETURNING status, attempts_allowed
      `
    );

    expect(row.status).toBe('idle');
    expect(row.attempts_allowed).toBe(1);
  });

  it('enforces correct_option between 1 and 5', () => {
    expect(() =>
      db.public.none(
        `
          INSERT INTO quests (
            id, title, type,
            option_a, option_b, option_c, option_d, option_e,
            correct_option
          ) VALUES (
            '00000000-0000-0000-0000-000000000002',
            'Invalid Quest',
            'daily',
            'A', 'B', 'C', 'D', 'E',
            6
          )
        `
      )
    ).toThrow();
  });

  it('cascades delete from quests to user_quests', () => {
    const questId = '00000000-0000-0000-0000-000000000003';
    const userId = '00000000-0000-0000-0000-0000000000aa';

    db.public.none(
      `
        INSERT INTO quests (
          id, title, type,
          option_a, option_b, option_c, option_d, option_e,
          correct_option
        ) VALUES (
          '${questId}', 'Cascade Quest', 'weekly',
          'A', 'B', 'C', 'D', 'E',
          1
        )
      `
    );

    db.public.none(
      `
        INSERT INTO user_quests (id, quest_id, user_id)
        VALUES (
          '00000000-0000-0000-0000-0000000000bb',
          '${questId}',
          '${userId}'
        )
      `
    );

    db.public.none(`DELETE FROM quests WHERE id = '${questId}'`);

    const remaining = db.public.one(
      `
        SELECT COUNT(*)::int AS count
        FROM user_quests
        WHERE quest_id = '${questId}'
      `
    );

    expect(remaining.count).toBe(0);
  });

  it('enforces selected_option between 1 and 5 for user_quests', () => {
    const questId = '00000000-0000-0000-0000-000000000004';

    db.public.none(
      `
        INSERT INTO quests (
          id, title, type,
          option_a, option_b, option_c, option_d, option_e,
          correct_option
        ) VALUES (
          '${questId}', 'Selection Quest', 'event',
          'A', 'B', 'C', 'D', 'E',
          2
        )
      `
    );

    expect(() =>
      db.public.none(
        `
          INSERT INTO user_quests (id, quest_id, user_id, selected_option)
          VALUES (
            '00000000-0000-0000-0000-0000000000cc',
            '${questId}',
            '00000000-0000-0000-0000-0000000000dd',
            6
          )
        `
      )
    ).toThrow();
  });
});
