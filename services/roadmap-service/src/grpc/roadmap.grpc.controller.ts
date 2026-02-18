import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RoadmapDomainService } from '../domain/roadmap.domain.service';

type GetActiveRoadmapRequest = {
  user_id: string;
};

type RecalculateTimelineRequest = {
  roadmap_id: string;
};

type InterviewTurnRequest = {
  user_id: string;
  tenant_id: string;
  draft_id?: string;
  messages: Array<{ question: string; answer: string }>;
};

type CreateDraftRequest = {
  user_id: string;
  tenant_id: string;
  title?: string;
  target_role?: string;
  target_grade?: string;
  interview_log_json?: string;
  roadmap_nodes_json?: string;
  canvas_viewport_json?: string;
};

type UpdateDraftCanvasRequest = {
  draft_id: string;
  user_id: string;
  canvas_viewport_json: string;
  roadmap_nodes_json?: string;
};

type ListDraftsRequest = {
  user_id: string;
};

@Controller()
export class RoadmapGrpcController {
  constructor(private readonly roadmapDomainService: RoadmapDomainService) {}

  @GrpcMethod('RoadmapService', 'GetActiveRoadmap')
  async getActiveRoadmap(payload: GetActiveRoadmapRequest) {
    return this.roadmapDomainService.getActiveRoadmap(payload.user_id);
  }

  @GrpcMethod('RoadmapService', 'RecalculateTimeline')
  async recalculateTimeline(payload: RecalculateTimelineRequest) {
    await this.roadmapDomainService.recalculateTimeline(payload.roadmap_id);
    return {
      ok: true,
      message: 'Timeline recalculated'
    };
  }

  @GrpcMethod('RoadmapService', 'InterviewTurn')
  async interviewTurn(payload: InterviewTurnRequest) {
    return this.roadmapDomainService.interviewTurn({
      userId: payload.user_id,
      tenantId: payload.tenant_id,
      draftId: payload.draft_id,
      messages: payload.messages ?? []
    });
  }

  @GrpcMethod('RoadmapService', 'CreateDraft')
  async createDraft(payload: CreateDraftRequest) {
    return this.roadmapDomainService.createDraft({
      userId: payload.user_id,
      tenantId: payload.tenant_id,
      title: payload.title,
      targetRole: payload.target_role,
      targetGrade: payload.target_grade,
      interviewLog: parseArrayPayload<{ question: string; answer: string }>(payload.interview_log_json),
      roadmapNodes: parseArrayPayload<{ id: string; label: string; progress: number; x: number; y: number }>(
        payload.roadmap_nodes_json
      ),
      canvasViewport: parseObjectPayload(payload.canvas_viewport_json)
    });
  }

  @GrpcMethod('RoadmapService', 'UpdateDraftCanvas')
  async updateDraftCanvas(payload: UpdateDraftCanvasRequest) {
    return this.roadmapDomainService.updateDraftCanvas({
      draftId: payload.draft_id,
      userId: payload.user_id,
      canvasViewport: parseObjectPayload(payload.canvas_viewport_json),
      roadmapNodes: parseArrayPayload<{ id: string; label: string; progress: number; x: number; y: number }>(
        payload.roadmap_nodes_json
      )
    });
  }

  @GrpcMethod('RoadmapService', 'ListDrafts')
  async listDrafts(payload: ListDraftsRequest) {
    const items = await this.roadmapDomainService.listDrafts(payload.user_id);
    return { items };
  }
}

function parseArrayPayload<T>(value?: string): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function parseObjectPayload(value?: string): { x: number; y: number; scale: number } {
  if (!value) {
    return { x: 0, y: 0, scale: 1 };
  }

  try {
    const parsed = JSON.parse(value) as { x?: number; y?: number; scale?: number };
    return {
      x: Number(parsed.x ?? 0),
      y: Number(parsed.y ?? 0),
      scale: Number(parsed.scale ?? 1)
    };
  } catch {
    return { x: 0, y: 0, scale: 1 };
  }
}
