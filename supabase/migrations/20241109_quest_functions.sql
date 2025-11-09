-- Create function to increment premium quest attempts
CREATE OR REPLACE FUNCTION increment_premium_attempts(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS void AS $$
BEGIN
  INSERT INTO premium_quest_attempts_monthly (user_id, year, month, attempts_used)
  VALUES (p_user_id, p_year, p_month, 1)
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET 
    attempts_used = premium_quest_attempts_monthly.attempts_used + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_premium_attempts(UUID, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION increment_premium_attempts IS 'Increments the monthly premium quest attempt count for a user';
