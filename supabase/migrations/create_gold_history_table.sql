-- Create gold_history table to track user gold changes over time
CREATE TABLE IF NOT EXISTS gold_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gold INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries by user_id and timestamp
CREATE INDEX IF NOT EXISTS idx_gold_history_user_id ON gold_history(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_history_timestamp ON gold_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gold_history_user_timestamp ON gold_history(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE gold_history ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own gold history
CREATE POLICY "Users can view their own gold history"
  ON gold_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own gold history
CREATE POLICY "Users can insert their own gold history"
  ON gold_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users cannot update or delete gold history (immutable log)
-- No UPDATE or DELETE policies = no one can modify history

-- Optional: Function to automatically add gold history entry when profile.gold changes
CREATE OR REPLACE FUNCTION log_gold_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if gold actually changed
  IF (TG_OP = 'UPDATE' AND OLD.gold IS DISTINCT FROM NEW.gold) OR TG_OP = 'INSERT' THEN
    INSERT INTO gold_history (user_id, gold, timestamp)
    VALUES (NEW.id, NEW.gold, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log gold changes
DROP TRIGGER IF EXISTS trigger_log_gold_change ON profiles;
CREATE TRIGGER trigger_log_gold_change
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_gold_change();

-- Comment on table and columns
COMMENT ON TABLE gold_history IS 'Tracks historical gold balance changes for each user';
COMMENT ON COLUMN gold_history.user_id IS 'Reference to the user (auth.users.id)';
COMMENT ON COLUMN gold_history.gold IS 'Gold amount at this point in time';
COMMENT ON COLUMN gold_history.timestamp IS 'When this gold amount was recorded';
