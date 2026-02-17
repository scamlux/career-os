CREATE TABLE progress_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  source_event_type VARCHAR(128) NOT NULL,
  source_event_id UUID NOT NULL,
  metric_key VARCHAR(128) NOT NULL,
  metric_value NUMERIC(10,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_event_id, metric_key)
);

CREATE TABLE mastery_scores (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_key VARCHAR(128) NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, skill_key)
);

CREATE TABLE productivity_metrics (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_days INT NOT NULL DEFAULT 0,
  weekly_minutes INT NOT NULL DEFAULT 0,
  productivity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  prediction_json JSONB,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_progress_logs_user_id ON progress_logs(user_id);
CREATE INDEX idx_mastery_scores_user_id ON mastery_scores(user_id);
