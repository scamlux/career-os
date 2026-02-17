CREATE TABLE plans (
  id UUID PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  billing_interval VARCHAR(32) NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  features_json JSONB NOT NULL,
  ai_quota_monthly INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_accounts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  external_customer_ref VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  organization_id UUID,
  plan_id UUID NOT NULL,
  status VARCHAR(32) NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  status VARCHAR(32) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  external_invoice_ref VARCHAR(128)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
