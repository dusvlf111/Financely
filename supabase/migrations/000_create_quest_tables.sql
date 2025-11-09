-- Migration: Create quest-related tables
-- Note: Assumes Postgres. Adds tables: quests, user_quests, quest_rewards

-- Enable uuid generation if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- quests table: stores quest definitions (5-choice 객관식 고정)
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  -- type: daily / weekly / monthly / premium / event
  type text NOT NULL,
  -- time limit in seconds for the question
  time_limit_seconds int NOT NULL DEFAULT 30,
  -- attempt allowance (most quests are single-attempt)
  attempts_allowed int NOT NULL DEFAULT 1,
  -- 5지선다 고정: option_a ~ option_e
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  option_e text NOT NULL,
  -- correct option: 1..5
  correct_option smallint NOT NULL CHECK (correct_option BETWEEN 1 AND 5),
  reward jsonb,
  start_at timestamptz,
  expire_at timestamptz,
  status text NOT NULL DEFAULT 'idle', -- idle | in_progress | completed | failed
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(type);
CREATE INDEX IF NOT EXISTS idx_quests_expire_at ON quests(expire_at);

-- user_quests table: records user's attempt on a quest
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'in_progress', -- in_progress | completed | failed
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  time_taken_seconds int,
  selected_option smallint CHECK (selected_option BETWEEN 1 AND 5),
  is_success boolean DEFAULT false,
  attempts int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_quests_user ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest ON user_quests(quest_id);

-- quest_rewards table: reward issuance log
CREATE TABLE IF NOT EXISTS quest_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_quest_id uuid REFERENCES user_quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reward jsonb NOT NULL,
  issued boolean NOT NULL DEFAULT false,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quest_rewards_user ON quest_rewards(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_quests_updated_at
BEFORE UPDATE ON quests
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_user_quests_updated_at
BEFORE UPDATE ON user_quests
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
