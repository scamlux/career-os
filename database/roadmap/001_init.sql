CREATE TABLE career_goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  goal_key VARCHAR(128) NOT NULL,
  target_role VARCHAR(255) NOT NULL,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE roadmaps (
  id UUID PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  version INT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  generated_by VARCHAR(32) NOT NULL DEFAULT 'AI',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (goal_id, version)
);

CREATE TABLE stages (
  id UUID PRIMARY KEY,
  roadmap_id UUID NOT NULL,
  stage_order INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (roadmap_id, stage_order)
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY,
  stage_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roadmap_skills (
  roadmap_id UUID NOT NULL,
  skill_key VARCHAR(128) NOT NULL,
  target_proficiency NUMERIC(5,2) NOT NULL,
  PRIMARY KEY (roadmap_id, skill_key)
);

CREATE TABLE roadmap_drafts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Roadmap draft',
  target_role VARCHAR(255) NOT NULL DEFAULT '',
  target_grade VARCHAR(64) NOT NULL DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  interview_log_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  roadmap_nodes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  canvas_viewport_json JSONB NOT NULL DEFAULT '{"x":0,"y":0,"scale":1}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_stages_roadmap_id ON stages(roadmap_id);
CREATE INDEX idx_milestones_stage_id ON milestones(stage_id);
CREATE INDEX idx_roadmap_drafts_user_id ON roadmap_drafts(user_id);
