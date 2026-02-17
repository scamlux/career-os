CREATE TABLE ai_flows (
  id UUID PRIMARY KEY,
  flow_name VARCHAR(128) NOT NULL,
  flow_version VARCHAR(32) NOT NULL,
  prompt_version VARCHAR(32) NOT NULL,
  input_schema_json JSONB NOT NULL,
  output_schema_json JSONB NOT NULL,
  retry_policy_json JSONB NOT NULL,
  fallback_policy_json JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (flow_name, flow_version)
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  flow_name VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ai_outputs (
  id UUID PRIMARY KEY,
  execution_id UUID UNIQUE NOT NULL,
  conversation_id UUID,
  user_id UUID NOT NULL,
  flow_name VARCHAR(128) NOT NULL,
  flow_version VARCHAR(32) NOT NULL,
  output_json JSONB NOT NULL,
  status VARCHAR(32) NOT NULL,
  confidence NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE token_usage (
  id UUID PRIMARY KEY,
  execution_id UUID UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  model_name VARCHAR(128) NOT NULL,
  prompt_tokens INT NOT NULL,
  completion_tokens INT NOT NULL,
  total_cost_usd NUMERIC(12,6) NOT NULL,
  latency_ms INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_outputs_user_id ON ai_outputs(user_id);
CREATE INDEX idx_ai_outputs_flow_name ON ai_outputs(flow_name);
CREATE INDEX idx_token_usage_tenant_id ON token_usage(tenant_id);
CREATE INDEX idx_token_usage_created_at ON token_usage(created_at);
