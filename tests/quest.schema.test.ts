import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Quest migration schema checks', () => {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '000_create_quest_tables.sql');
  let sql = '';

  beforeAll(() => {
    if (fs.existsSync(migrationPath)) {
      sql = fs.readFileSync(migrationPath, 'utf8');
    }
  });

  it('migration file should exist', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('defines 5-choice options (option_a..option_e)', () => {
    expect(sql).toContain('option_a');
    expect(sql).toContain('option_b');
    expect(sql).toContain('option_c');
    expect(sql).toContain('option_d');
    expect(sql).toContain('option_e');
  });

  it('defines correct_option with CHECK 1..5', () => {
    expect(sql).toMatch(/correct_option\s+smallint/i);
    expect(sql).toMatch(/CHECK \(correct_option BETWEEN 1 AND 5\)/i);
  });

  it('defines user_quests and quest_rewards tables', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS user_quests/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS quest_rewards/i);
  });
});
