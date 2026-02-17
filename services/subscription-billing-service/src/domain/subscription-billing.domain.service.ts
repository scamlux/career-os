import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEnvelope, KafkaProducerService, PostgresService } from '@careeros/shared';
import { v4 as uuidv4 } from 'uuid';

type PlanRow = {
  id: string;
  code: string;
  features_json: string[];
};

type SubscriptionRow = {
  id: string;
  plan_code: string;
  status: string;
  current_period_end: Date | null;
  features_json: string[];
};

@Injectable()
export class SubscriptionBillingDomainService {
  private readonly logger = new Logger(SubscriptionBillingDomainService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly kafka: KafkaProducerService
  ) {}

  async createPlan(input: {
    code: string;
    name: string;
    billingInterval: string;
    priceUsd: number;
    features: string[];
    aiQuotaMonthly?: number;
  }): Promise<void> {
    await this.postgres.query(
      `
      INSERT INTO plans (id, code, name, billing_interval, price_usd, features_json, ai_quota_monthly)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
      ON CONFLICT (code) DO UPDATE
      SET name = EXCLUDED.name,
          billing_interval = EXCLUDED.billing_interval,
          price_usd = EXCLUDED.price_usd,
          features_json = EXCLUDED.features_json,
          ai_quota_monthly = EXCLUDED.ai_quota_monthly
      `,
      [
        uuidv4(),
        input.code,
        input.name,
        input.billingInterval,
        input.priceUsd,
        JSON.stringify(input.features),
        input.aiQuotaMonthly ?? null
      ]
    );
  }

  async activateSubscription(input: {
    userId?: string;
    organizationId?: string;
    tenantId: string;
    planCode: string;
    status?: string;
  }): Promise<{ subscription_id: string; status: string }> {
    if (!input.userId && !input.organizationId) {
      throw new BadRequestException('Either userId or organizationId must be provided');
    }

    const plan = await this.postgres.query<PlanRow>(
      `
      SELECT id, code, features_json
      FROM plans
      WHERE code = $1
      LIMIT 1
      `,
      [input.planCode]
    );

    const planRow = plan.rows[0];
    if (!planRow) {
      throw new BadRequestException(`Plan '${input.planCode}' not found`);
    }

    const subscriptionId = uuidv4();
    const status = input.status ?? 'ACTIVE';

    await this.postgres.query(
      `
      INSERT INTO subscriptions (
        id,
        user_id,
        organization_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '30 days')
      `,
      [subscriptionId, input.userId ?? null, input.organizationId ?? null, planRow.id, status]
    );

    await this.publishBestEffort(
      'careeros.billing.subscription-activated.v1',
      this.buildEnvelope('SubscriptionActivated', input.tenantId, input.userId, {
        subscription_id: subscriptionId,
        user_id: input.userId,
        organization_id: input.organizationId,
        plan_code: input.planCode,
        activated_at: new Date().toISOString(),
        status
      })
    );

    return {
      subscription_id: subscriptionId,
      status
    };
  }

  async processWebhook(eventType: string, payload: Record<string, unknown>): Promise<void> {
    if (eventType === 'invoice.paid') {
      const invoiceRef = String(payload['invoice_ref'] ?? '');
      await this.postgres.query(
        `
        UPDATE invoices
        SET status = 'PAID', paid_at = NOW()
        WHERE external_invoice_ref = $1
        `,
        [invoiceRef]
      );
      return;
    }

    if (eventType === 'subscription.canceled') {
      const subscriptionId = String(payload['subscription_id'] ?? '');
      await this.postgres.query(
        `
        UPDATE subscriptions
        SET status = 'CANCELED', updated_at = NOW()
        WHERE id = $1
        `,
        [subscriptionId]
      );
    }
  }

  async checkEntitlement(userId: string, featureKey: string): Promise<{ allowed: boolean; reason: string }> {
    const subscription = await this.getSubscriptionByUserId(userId);

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No active subscription'
      };
    }

    if (subscription.features_json.includes('*') || subscription.features_json.includes(featureKey)) {
      return {
        allowed: true,
        reason: 'Allowed'
      };
    }

    return {
      allowed: false,
      reason: `Feature '${featureKey}' is not included in plan ${subscription.plan_code}`
    };
  }

  async getActiveSubscription(userId: string): Promise<{ plan_code: string; status: string; renew_at: string }> {
    const subscription = await this.getSubscriptionByUserId(userId);

    if (!subscription) {
      return {
        plan_code: 'FREE',
        status: 'INACTIVE',
        renew_at: ''
      };
    }

    return {
      plan_code: subscription.plan_code,
      status: subscription.status,
      renew_at: subscription.current_period_end ? new Date(subscription.current_period_end).toISOString() : ''
    };
  }

  private async getSubscriptionByUserId(userId: string): Promise<SubscriptionRow | null> {
    const result = await this.postgres.query<SubscriptionRow>(
      `
      SELECT
        s.id,
        p.code AS plan_code,
        s.status,
        s.current_period_end,
        p.features_json
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.user_id = $1
        AND s.status IN ('ACTIVE', 'TRIAL', 'PAST_DUE')
      ORDER BY s.updated_at DESC
      LIMIT 1
      `,
      [userId]
    );

    return result.rows[0] ?? null;
  }

  private buildEnvelope<T>(eventType: string, tenantId: string, userId: string | undefined, payload: T): EventEnvelope<T> {
    return {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      source: 'subscription-billing-service',
      tenant_id: tenantId,
      user_id: userId,
      payload
    };
  }

  private async publishBestEffort<T>(topic: string, envelope: EventEnvelope<T>): Promise<void> {
    try {
      await this.kafka.publish(topic, envelope);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown kafka publish error';
      this.logger.warn(`Kafka publish skipped for ${topic}: ${message}`);
    }
  }
}
