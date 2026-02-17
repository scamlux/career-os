import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RoadmapDomainService } from '../domain/roadmap.domain.service';

type GetActiveRoadmapRequest = {
  user_id: string;
};

type RecalculateTimelineRequest = {
  roadmap_id: string;
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
}
