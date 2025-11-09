-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'premium', 'event')),
  question TEXT, -- For premium and event quests
  answer TEXT, -- Correct answer for validation
  answer_options JSONB, -- For multiple choice questions
  time_limit INTEGER, -- Time limit in seconds
  reward_gold INTEGER DEFAULT 0,
  reward_energy INTEGER DEFAULT 0,
  reward_stock_name TEXT, -- Stock reward name (e.g., "엔비디아 소수점주식")
  reward_stock_value INTEGER, -- Stock reward value in KRW
  reward_type TEXT CHECK (reward_type IN ('확정', '응모권', NULL)), -- Confirmed or lottery ticket
  target INTEGER DEFAULT 1, -- Target count to complete (for progress quests)
  progress_type TEXT CHECK (progress_type IN ('attendance', 'problems_solved', 'accuracy', 'league_rank', 'premium_quests', 'streak', NULL)),
  is_premium_only BOOLEAN DEFAULT FALSE,
  max_participants INTEGER, -- For event quests (e.g., 50)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Create user_quest_attempts table to track quest attempts
CREATE TABLE IF NOT EXISTS user_quest_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  user_answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER, -- Time taken in seconds
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed', 'timeout')),
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, quest_id) -- One attempt per quest per user
);

-- Create user_quest_progress table for tracking progress-based quests
CREATE TABLE IF NOT EXISTS user_quest_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  reset_at TIMESTAMPTZ, -- When this progress will reset (for daily/weekly/monthly)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, quest_id)
);

-- Create quest_participants table for event quests (first-come-first-served)
CREATE TABLE IF NOT EXISTS quest_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(quest_id, user_id)
);

-- Create premium_quest_attempts_monthly table to track monthly premium quest attempts
CREATE TABLE IF NOT EXISTS premium_quest_attempts_monthly (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  attempts_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, year, month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(type);
CREATE INDEX IF NOT EXISTS idx_quests_deleted_at ON quests(deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_quest_attempts_user_id ON user_quest_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_attempts_quest_id ON user_quest_attempts(quest_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user_id ON user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_quest_id ON user_quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_participants_quest_id ON quest_participants(quest_id);
CREATE INDEX IF NOT EXISTS idx_premium_quest_attempts_user_id ON premium_quest_attempts_monthly(user_id);

-- Enable Row Level Security
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_quest_attempts_monthly ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quests (everyone can read active quests)
CREATE POLICY "Everyone can view active quests"
  ON quests
  FOR SELECT
  USING (deleted_at IS NULL);

-- RLS Policies for user_quest_attempts
CREATE POLICY "Users can view their own quest attempts"
  ON user_quest_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest attempts"
  ON user_quest_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest attempts"
  ON user_quest_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_quest_progress
CREATE POLICY "Users can view their own quest progress"
  ON user_quest_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest progress"
  ON user_quest_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest progress"
  ON user_quest_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for quest_participants
CREATE POLICY "Everyone can view quest participants count"
  ON quest_participants
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join event quests"
  ON quest_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for premium_quest_attempts_monthly
CREATE POLICY "Users can view their own premium quest attempts"
  ON premium_quest_attempts_monthly
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own premium quest attempts"
  ON premium_quest_attempts_monthly
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own premium quest attempts"
  ON premium_quest_attempts_monthly
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_quests_updated_at
  BEFORE UPDATE ON quests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quest_progress_updated_at
  BEFORE UPDATE ON user_quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_quest_attempts_updated_at
  BEFORE UPDATE ON premium_quest_attempts_monthly
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE quests IS 'Quest definitions for all quest types';
COMMENT ON TABLE user_quest_attempts IS 'Tracks user attempts at solving quests (one-time challenges)';
COMMENT ON TABLE user_quest_progress IS 'Tracks progress-based quest completion (e.g., daily tasks)';
COMMENT ON TABLE quest_participants IS 'Tracks participants in event quests (first-come-first-served)';
COMMENT ON TABLE premium_quest_attempts_monthly IS 'Tracks monthly premium quest attempt limits';
