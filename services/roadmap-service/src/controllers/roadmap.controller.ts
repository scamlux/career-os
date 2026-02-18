import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RoadmapDomainService } from '../domain/roadmap.domain.service';
import { CompleteMilestoneDto } from '../dto/complete-milestone.dto';
import { CreateRoadmapDraftDto } from '../dto/create-roadmap-draft.dto';
import { CreateRoadmapDto } from '../dto/create-roadmap.dto';
import { InterviewTurnDto } from '../dto/interview-turn.dto';
import { UpdateRoadmapDraftCanvasDto } from '../dto/update-roadmap-draft-canvas.dto';

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

  @Post('interview/turn')
  async interviewTurn(@Body() dto: InterviewTurnDto) {
    return this.roadmapDomainService.interviewTurn({
      userId: dto.userId,
      tenantId: dto.tenantId,
      draftId: dto.draftId,
      messages: dto.messages
    });
  }

  @Post('drafts')
  async createDraft(@Body() dto: CreateRoadmapDraftDto) {
    return this.roadmapDomainService.createDraft({
      userId: dto.userId,
      tenantId: dto.tenantId,
      title: dto.title,
      targetRole: dto.targetRole,
      targetGrade: dto.targetGrade,
      interviewLog: dto.interviewLog,
      roadmapNodes: dto.roadmapNodes,
      canvasViewport: dto.canvasViewport
    });
  }

  @Get('drafts/:userId')
  async listDrafts(@Param('userId') userId: string) {
    return this.roadmapDomainService.listDrafts(userId);
  }

  @Patch('drafts/:draftId/canvas')
  async updateDraftCanvas(@Param('draftId') draftId: string, @Body() dto: UpdateRoadmapDraftCanvasDto) {
    return this.roadmapDomainService.updateDraftCanvas({
      draftId,
      userId: dto.userId,
      canvasViewport: dto.canvasViewport,
      roadmapNodes: dto.roadmapNodes
    });
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
