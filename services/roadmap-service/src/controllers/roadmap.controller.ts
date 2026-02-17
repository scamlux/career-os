import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RoadmapDomainService } from '../domain/roadmap.domain.service';
import { CompleteMilestoneDto } from '../dto/complete-milestone.dto';
import { CreateRoadmapDto } from '../dto/create-roadmap.dto';

@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmapDomainService: RoadmapDomainService) {}

  @Post()
  async createRoadmap(@Body() dto: CreateRoadmapDto) {
    return this.roadmapDomainService.createRoadmap({
      userId: dto.userId,
      tenantId: dto.tenantId,
      goalKey: dto.goalKey,
      targetRole: dto.targetRole,
      timelineWeeks: dto.timelineWeeks,
      stageTitles: dto.stageTitles
    });
  }

  @Get('active/:userId')
  async getActiveRoadmap(@Param('userId') userId: string) {
    return this.roadmapDomainService.getActiveRoadmap(userId);
  }

  @Patch(':roadmapId/recalculate')
  async recalculateTimeline(@Param('roadmapId') roadmapId: string) {
    await this.roadmapDomainService.recalculateTimeline(roadmapId);
    return { ok: true };
  }

  @Patch('milestones/complete')
  async completeMilestone(@Body() dto: CompleteMilestoneDto) {
    await this.roadmapDomainService.completeMilestone({
      milestoneId: dto.milestoneId,
      tenantId: dto.tenantId,
      userId: dto.userId
    });

    return { ok: true };
  }
}
