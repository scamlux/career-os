CREATE TABLE instructors (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  payout_account_ref TEXT,
  revenue_share_percent NUMERIC(5,2) NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
  id UUID PRIMARY KEY,
  instructor_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  level VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE modules (
  id UUID PRIMARY KEY,
  course_id UUID NOT NULL,
  module_order INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  UNIQUE(course_id, module_order)
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  module_id UUID NOT NULL,
  lesson_order INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(32) NOT NULL,
  video_storage_key TEXT,
  duration_minutes INT,
  UNIQUE(module_id, lesson_order)
);

CREATE TABLE quizzes (
  id UUID PRIMARY KEY,
  lesson_id UUID NOT NULL,
  pass_score INT NOT NULL DEFAULT 70,
  config_json JSONB NOT NULL
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  lesson_id UUID NOT NULL,
  instructions TEXT NOT NULL,
  rubric_json JSONB
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_code VARCHAR(64) UNIQUE NOT NULL
);

CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
