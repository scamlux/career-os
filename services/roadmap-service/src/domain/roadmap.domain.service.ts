import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { EventEnvelope, KafkaProducerService, PostgresService } from '@careeros/shared';
import { firstValueFrom, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

type RoadmapRow = {
  id: string;
  version: number;
  status: string;
};

type DraftRow = {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  target_role: string;
  target_grade: string;
  status: string;
  interview_log_json: unknown;
  roadmap_nodes_json: unknown;
  canvas_viewport_json: unknown;
  created_at: string;
  updated_at: string;
};

type AICoreGrpc = {
  ExecuteFlow(req: {
    meta: { user_id: string; tenant_id: string };
    flow_name: string;
    flow_version?: string;
    input_json: string;
  }): Observable<{ execution_id: string; status: string; output_json: string; confidence: number }>;
};

type InterviewMessage = {
  question: string;
  answer: string;
};

type RoadmapNode = {
  id: string;
  label: string;
  progress: number;
  x: number;
  y: number;
};

type Viewport = {
  x: number;
  y: number;
  scale: number;
};

const FALLBACK_QUESTIONS = [
  'Какая конкретная роль и грейд сейчас твой приоритет?',
  'Сколько часов в неделю ты готов стабильно выделять?',
  'Какие проекты хочешь сделать в портфолио за ближайшие 3 месяца?',
  'Какие soft-skills для тебя критичны: коммуникация, презентация, лидерство?',
  'В каком рынке планируешь искать работу: локальный или международный?'
];

@Injectable()
export class RoadmapDomainService implements OnModuleInit {
  private aiCoreService!: AICoreGrpc;

  constructor(
    private readonly postgres: PostgresService,
    private readonly kafka: KafkaProducerService,
    @Inject('AI_CORE_GRPC') private readonly aiCoreClient: ClientGrpc
  ) {}

  onModuleInit(): void {
    this.aiCoreService = this.aiCoreClient.getService<AICoreGrpc>('AICoreService');
  }

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

  async interviewTurn(input: {
    userId: string;
    tenantId: string;
    draftId?: string;
    messages: InterviewMessage[];
  }): Promise<{
    draft_id: string;
    next_question: string;
    status: string;
    summary: string;
    ai_execution_id: string;
  }> {
    const aiResult = await firstValueFrom(
      this.aiCoreService.ExecuteFlow({
        meta: {
          user_id: input.userId,
          tenant_id: input.tenantId
        },
        flow_name: 'roadmap_generator',
        flow_version: 'v1',
        input_json: JSON.stringify({
          interview_mode: true,
          messages: input.messages
        })
      })
    );

    const parsed = safeJsonParse(aiResult.output_json);
    const messageCount = input.messages.length;
    const questionFromModel = typeof parsed['next_question'] === 'string' ? parsed['next_question'] : '';
    const fallbackQuestion = FALLBACK_QUESTIONS[messageCount % FALLBACK_QUESTIONS.length];
    const nextQuestion = questionFromModel || fallbackQuestion;
    const summary =
      typeof parsed['summary'] === 'string'
        ? parsed['summary']
        : `Интервью обновлено. Собрано ответов: ${messageCount}.`;

    const draft = await this.saveDraft({
      id: input.draftId,
      userId: input.userId,
      tenantId: input.tenantId,
      interviewLog: input.messages,
      title: 'AI Roadmap Interview Draft'
    });

    return {
      draft_id: draft.id,
      next_question: nextQuestion,
      status: aiResult.status,
      summary,
      ai_execution_id: aiResult.execution_id
    };
  }

  async createDraft(input: {
    userId: string;
    tenantId: string;
    title?: string;
    targetRole?: string;
    targetGrade?: string;
    interviewLog?: InterviewMessage[];
    roadmapNodes?: RoadmapNode[];
    canvasViewport?: Viewport;
  }) {
    return this.saveDraft({
      userId: input.userId,
      tenantId: input.tenantId,
      title: input.title,
      targetRole: input.targetRole,
      targetGrade: input.targetGrade,
      interviewLog: input.interviewLog,
      roadmapNodes: input.roadmapNodes,
      canvasViewport: input.canvasViewport
    });
  }

  async updateDraftCanvas(input: {
    draftId: string;
    userId: string;
    canvasViewport: Viewport;
    roadmapNodes?: RoadmapNode[];
  }) {
    const result = await this.postgres.query<DraftRow>(
      `
      UPDATE roadmap_drafts
      SET
        canvas_viewport_json = $1::jsonb,
        roadmap_nodes_json = COALESCE($2::jsonb, roadmap_nodes_json),
        updated_at = NOW()
      WHERE id = $3
        AND user_id = $4
      RETURNING id, user_id, tenant_id, title, target_role, target_grade, status,
                interview_log_json, roadmap_nodes_json, canvas_viewport_json,
                created_at::text, updated_at::text
      `,
      [JSON.stringify(input.canvasViewport), input.roadmapNodes ? JSON.stringify(input.roadmapNodes) : null, input.draftId, input.userId]
    );

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('Roadmap draft not found');
    }

    return mapDraftRow(row);
  }

  async listDrafts(userId: string) {
    const result = await this.postgres.query<DraftRow>(
      `
      SELECT id, user_id, tenant_id, title, target_role, target_grade, status,
             interview_log_json, roadmap_nodes_json, canvas_viewport_json,
             created_at::text, updated_at::text
      FROM roadmap_drafts
      WHERE user_id = $1
      ORDER BY updated_at DESC
      `,
      [userId]
    );

    return result.rows.map(mapDraftRow);
  }

  private async saveDraft(input: {
    id?: string;
    userId: string;
    tenantId: string;
    title?: string;
    targetRole?: string;
    targetGrade?: string;
    interviewLog?: InterviewMessage[];
    roadmapNodes?: RoadmapNode[];
    canvasViewport?: Viewport;
  }) {
    const draftId = input.id ?? uuidv4();
    const result = await this.postgres.query<DraftRow>(
      `
      INSERT INTO roadmap_drafts (
        id,
        user_id,
        tenant_id,
        title,
        target_role,
        target_grade,
        interview_log_json,
        roadmap_nodes_json,
        canvas_viewport_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        title = COALESCE(EXCLUDED.title, roadmap_drafts.title),
        target_role = COALESCE(EXCLUDED.target_role, roadmap_drafts.target_role),
        target_grade = COALESCE(EXCLUDED.target_grade, roadmap_drafts.target_grade),
        interview_log_json = COALESCE(EXCLUDED.interview_log_json, roadmap_drafts.interview_log_json),
        roadmap_nodes_json = COALESCE(EXCLUDED.roadmap_nodes_json, roadmap_drafts.roadmap_nodes_json),
        canvas_viewport_json = COALESCE(EXCLUDED.canvas_viewport_json, roadmap_drafts.canvas_viewport_json),
        updated_at = NOW()
      RETURNING id, user_id, tenant_id, title, target_role, target_grade, status,
                interview_log_json, roadmap_nodes_json, canvas_viewport_json,
                created_at::text, updated_at::text
      `,
      [
        draftId,
        input.userId,
        input.tenantId,
        input.title ?? 'Roadmap draft',
        input.targetRole ?? '',
        input.targetGrade ?? '',
        JSON.stringify(input.interviewLog ?? []),
        JSON.stringify(input.roadmapNodes ?? []),
        JSON.stringify(input.canvasViewport ?? { x: 0, y: 0, scale: 1 })
      ]
    );

    return mapDraftRow(result.rows[0]);
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

function mapDraftRow(row: DraftRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    tenant_id: row.tenant_id,
    title: row.title,
    target_role: row.target_role,
    target_grade: row.target_grade,
    status: row.status,
    interview_log_json: JSON.stringify(row.interview_log_json ?? []),
    roadmap_nodes_json: JSON.stringify(row.roadmap_nodes_json ?? []),
    canvas_viewport_json: JSON.stringify(row.canvas_viewport_json ?? { x: 0, y: 0, scale: 1 }),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function safeJsonParse(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Ignore malformed payloads and fallback to empty object.
  }

  return {};
}
