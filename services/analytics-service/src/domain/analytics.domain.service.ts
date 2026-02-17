import { Injectable } from '@nestjs/common';
import { PostgresService } from '@careeros/shared';
import { v4 as uuidv4 } from 'uuid';

type EventEnvelope = {
  event_id: string;
  event_type: string;
  tenant_id: string;
  user_id?: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class AnalyticsDomainService {
  constructor(private readonly postgres: PostgresService) {}

  async ingestEvent(event: EventEnvelope): Promise<void> {
    const funnelStep = this.mapFunnelStep(event.event_type);

    if (funnelStep) {
      await this.postgres.query(
        `
        INSERT INTO funnel_events (id, tenant_id, user_id, funnel_step)
        VALUES ($1, $2, $3, $4)
        `,
        [uuidv4(), event.tenant_id, event.user_id ?? null, funnelStep]
      );
    }

    if (event.event_type === 'AIFlowExecuted') {
      const flowName = String(event.payload['flow_name'] ?? 'unknown');
      const totalCost = Number(event.payload['total_cost_usd'] ?? 0);

      await this.postgres.query(
        `
        INSERT INTO ai_usage_analytics (id, tenant_id, user_id, flow_name, total_runs, total_cost_usd)
        VALUES ($1, $2, $3, $4, 1, $5)
        ON CONFLICT (tenant_id, user_id, flow_name)
        DO UPDATE SET
          total_runs = ai_usage_analytics.total_runs + 1,
          total_cost_usd = ai_usage_analytics.total_cost_usd + EXCLUDED.total_cost_usd,
          snapshot_at = NOW()
        `,
        [uuidv4(), event.tenant_id, event.user_id ?? null, flowName, totalCost]
      );
    }

    await this.recomputeDailyKpi(event.tenant_id, event.event_type);
  }

  async getKpiSnapshot(tenantId: string): Promise<{
    dau: number;
    wau: number;
    churn_risk_score: number;
    mrr_usd: number;
  }> {
    const result = await this.postgres.query<{
      dau: number;
      wau: number;
      churn_risk_score: string | null;
      mrr_usd: string;
    }>(
      `
      SELECT dau, wau, churn_risk_score::text AS churn_risk_score, mrr_usd::text AS mrr_usd
      FROM kpi_daily
      WHERE tenant_id = $1
      ORDER BY day DESC
      LIMIT 1
      `,
      [tenantId]
    );

    const row = result.rows[0];
    if (!row) {
      return {
        dau: 0,
        wau: 0,
        churn_risk_score: 0,
        mrr_usd: 0
      };
    }

    return {
      dau: row.dau,
      wau: row.wau,
      churn_risk_score: Number(row.churn_risk_score ?? 0),
      mrr_usd: Number(row.mrr_usd)
    };
  }

  private async recomputeDailyKpi(tenantId: string, eventType: string): Promise<void> {
    const dauResult = await this.postgres.query<{ value: string }>(
      `
      SELECT COUNT(DISTINCT user_id)::text AS value
      FROM funnel_events
      WHERE tenant_id = $1
        AND occurred_at >= NOW() - INTERVAL '1 day'
      `,
      [tenantId]
    );

    const wauResult = await this.postgres.query<{ value: string }>(
      `
      SELECT COUNT(DISTINCT user_id)::text AS value
      FROM funnel_events
      WHERE tenant_id = $1
        AND occurred_at >= NOW() - INTERVAL '7 days'
      `,
      [tenantId]
    );

    const mauResult = await this.postgres.query<{ value: string }>(
      `
      SELECT COUNT(DISTINCT user_id)::text AS value
      FROM funnel_events
      WHERE tenant_id = $1
        AND occurred_at >= NOW() - INTERVAL '30 days'
      `,
      [tenantId]
    );

    const existing = await this.postgres.query<{ mrr_usd: string }>(
      `
      SELECT mrr_usd::text AS mrr_usd
      FROM kpi_daily
      WHERE day = CURRENT_DATE AND tenant_id = $1
      LIMIT 1
      `,
      [tenantId]
    );

    const currentMrr = Number(existing.rows[0]?.mrr_usd ?? 0);
    const nextMrr = eventType === 'SubscriptionActivated' ? currentMrr + 20 : currentMrr;

    const mau = Number(mauResult.rows[0]?.value ?? 0);
    const dau = Number(dauResult.rows[0]?.value ?? 0);
    const churnRisk = mau === 0 ? 0 : Number(((mau - dau) / mau).toFixed(2));

    await this.postgres.query(
      `
      INSERT INTO kpi_daily (day, tenant_id, dau, wau, mau, mrr_usd, churn_risk_score)
      VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6)
      ON CONFLICT (day, tenant_id)
      DO UPDATE SET
        dau = EXCLUDED.dau,
        wau = EXCLUDED.wau,
        mau = EXCLUDED.mau,
        mrr_usd = EXCLUDED.mrr_usd,
        churn_risk_score = EXCLUDED.churn_risk_score
      `,
      [tenantId, dau, Number(wauResult.rows[0]?.value ?? 0), mau, nextMrr, churnRisk]
    );
  }

  private mapFunnelStep(eventType: string): string | null {
    if (eventType === 'UserRegistered') {
      return 'activation.signup';
    }

    if (eventType === 'RoadmapCreated') {
      return 'activation.roadmap_created';
    }

    if (eventType === 'LessonCompleted') {
      return 'activation.lesson_completed';
    }

    if (eventType === 'SubscriptionActivated') {
      return 'conversion.subscription_activated';
    }

    if (eventType === 'AIFlowExecuted') {
      return 'engagement.ai_flow';
    }

    return null;
  }
}
