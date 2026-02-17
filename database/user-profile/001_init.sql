CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  tenant_id UUID NOT NULL,
  full_name VARCHAR(255),
  title VARCHAR(255),
  location VARCHAR(128),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE skills (
  id UUID PRIMARY KEY,
  key VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  category VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_skills (
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL,
  proficiency NUMERIC(5,2) NOT NULL DEFAULT 0,
  evidence_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE experiences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  company VARCHAR(255),
  role VARCHAR(255),
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  storage_key TEXT NOT NULL,
  document_type VARCHAR(64) NOT NULL,
  mime_type VARCHAR(64) NOT NULL,
  size_bytes BIGINT NOT NULL,
  checksum_sha256 CHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_experiences_user_id ON experiences(user_id);
CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);
