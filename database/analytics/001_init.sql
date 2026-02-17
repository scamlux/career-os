CREATE TABLE kpi_daily (
  day DATE NOT NULL,
  tenant_id UUID NOT NULL,
  dau INT NOT NULL,
  wau INT NOT NULL,
  mau INT NOT NULL,
  mrr_usd NUMERIC(12,2) NOT NULL,
  churn_risk_score NUMERIC(5,2),
  PRIMARY KEY (day, tenant_id)
);

CREATE TABLE funnel_events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  funnel_step VARCHAR(128) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_usage_analytics (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  flow_name VARCHAR(128) NOT NULL,
  total_runs INT NOT NULL,
  total_cost_usd NUMERIC(12,6) NOT NULL,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id, flow_name)
);

CREATE INDEX idx_funnel_events_tenant_step ON funnel_events(tenant_id, funnel_step);
CREATE INDEX idx_ai_usage_analytics_tenant_flow ON ai_usage_analytics(tenant_id, flow_name);
