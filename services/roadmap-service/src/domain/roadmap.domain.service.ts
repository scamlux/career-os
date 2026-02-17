import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEnvelope, KafkaProducerService, PostgresService } from '@careeros/shared';
import { v4 as uuidv4 } from 'uuid';

type RoadmapRow = {
  id: string;
  version: number;
  status: string;
};

@Injectable()
export class RoadmapDomainService {
  constructor(
    private readonly postgres: PostgresService,
    private readonly kafka: KafkaProducerService
  ) {}

  async createRoadmap(input: {
    userId: string;
    tenantId: string;
    goalKey: string;
    targetRole: string;
    timelineWeeks?: number;
    stageTitles?: string[];
  }): Promise<{ roadmap_id: string; version: number; status: string }> {
    const goalId = uuidv4();
    const roadmapId = uuidv4();

    await this.postgres.query(
      `
      INSERT INTO career_goals (id, user_id, tenant_id, goal_key, target_role)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [goalId, input.userId, input.tenantId, input.goalKey, input.targetRole]
    );

    await this.postgres.query(
      `
      INSERT INTO roadmaps (id, goal_id, user_id, version, status, generated_by)
      VALUES ($1, $2, $3, 1, 'ACTIVE', 'AI')
      `,
      [roadmapId, goalId, input.userId]
    );

    const stages = input.stageTitles?.length
      ? input.stageTitles
      : ['Foundation', 'Core Skills', 'Projects', 'Interview Prep'];

    for (let i = 0; i < stages.length; i += 1) {
      await this.postgres.query(
        `
        INSERT INTO stages (id, roadmap_id, stage_order, title, status)
        VALUES ($1, $2, $3, $4, 'PENDING')
        `,
        [uuidv4(), roadmapId, i + 1, stages[i]]
      );
    }

    await this.kafka.publish(
      'careeros.roadmap.roadmap-created.v1',
      this.buildEnvelope('RoadmapCreated', input.tenantId, input.userId, {
        roadmap_id: roadmapId,
        user_id: input.userId,
        goal_key: input.goalKey,
        version: 1
      })
    );

    return { roadmap_id: roadmapId, version: 1, status: 'ACTIVE' };
  }

  async getActiveRoadmap(userId: string): Promise<{ roadmap_id: string; version: number; status: string }> {
    const result = await this.postgres.query<RoadmapRow>(
      `
      SELECT id, version, status
      FROM roadmaps
      WHERE user_id = $1
        AND status = 'ACTIVE'
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    const roadmap = result.rows[0];

    if (!roadmap) {
      return {
        roadmap_id: '',
        version: 0,
        status: 'NOT_FOUND'
      };
    }

    return {
      roadmap_id: roadmap.id,
      version: roadmap.version,
      status: roadmap.status
    };
  }

  async recalculateTimeline(roadmapId: string): Promise<void> {
    const stages = await this.postgres.query<{ id: string }>(
      `
      SELECT id
      FROM stages
      WHERE roadmap_id = $1
      ORDER BY stage_order ASC
      `,
      [roadmapId]
    );

    const today = new Date();

    for (let i = 0; i < stages.rows.length; i += 1) {
      const start = new Date(today);
      start.setDate(today.getDate() + i * 14);
      const end = new Date(start);
      end.setDate(start.getDate() + 13);

      await this.postgres.query(
        `
        UPDATE stages
        SET start_date = $1, end_date = $2
        WHERE id = $3
        `,
        [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10), stages.rows[i].id]
      );
    }
  }

  async completeMilestone(input: { milestoneId: string; tenantId: string; userId: string }): Promise<void> {
    const update = await this.postgres.query(
      `
      UPDATE milestones
      SET status = 'COMPLETED', completed_at = NOW()
      WHERE id = $1
      `,
      [input.milestoneId]
    );

    if (update.rowCount === 0) {
      throw new NotFoundException('Milestone not found');
    }

    await this.kafka.publish(
      'careeros.roadmap.milestone-completed.v1',
      this.buildEnvelope('MilestoneCompleted', input.tenantId, input.userId, {
        milestone_id: input.milestoneId,
        completed_at: new Date().toISOString()
      })
    );
  }

  private buildEnvelope<T>(eventType: string, tenantId: string, userId: string, payload: T): EventEnvelope<T> {
    return {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      source: 'roadmap-service',
      tenant_id: tenantId,
      user_id: userId,
      payload
    };
  }
}
