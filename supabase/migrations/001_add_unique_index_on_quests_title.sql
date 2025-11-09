-- Ensure quest titles remain unique to support application-level upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_quests_title_unique ON quests(title);
