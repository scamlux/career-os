import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GatewayFacade } from '../domain/gateway.facade';
import { GatewayAIChatDto } from '../dto/ai-chat.dto';
import { GatewayExecuteFlowDto } from '../dto/execute-flow.dto';
import { CreateRoadmapDraftDto, RoadmapInterviewTurnDto, UpdateRoadmapDraftCanvasDto } from '../dto/roadmap.dto';
import { ValidateTokenDto } from '../dto/validate-token.dto';

@Controller('v1')
export class GatewayController {
  constructor(private readonly gatewayFacade: GatewayFacade) {}

  @Post('auth/validate-token')
  async validateToken(@Body() dto: ValidateTokenDto) {
    return this.gatewayFacade.validateToken(dto.accessToken);
  }

  @Get('profiles/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.gatewayFacade.getProfile(userId);
  }

  @Post('ai/flows/execute')
  async executeAiFlow(@Body() dto: GatewayExecuteFlowDto) {
    return this.gatewayFacade.executeAiFlow({
      userId: dto.userId,
      tenantId: dto.tenantId,
      flowName: dto.flowName,
      flowVersion: dto.flowVersion,
      payload: dto.input
    });
  }

  @Post('ai/chat')
  async chatMentor(@Body() dto: GatewayAIChatDto) {
    return this.gatewayFacade.chatMentor({
      userId: dto.userId,
      tenantId: dto.tenantId,
      mode: dto.mode,
      messages: dto.messages
    });
  }

  @Get('roadmaps/active/:userId')
  async getActiveRoadmap(@Param('userId') userId: string) {
    return this.gatewayFacade.getActiveRoadmap(userId);
  }

  @Post('roadmaps/interview/turn')
  async roadmapInterviewTurn(@Body() dto: RoadmapInterviewTurnDto) {
    return this.gatewayFacade.roadmapInterviewTurn({
      userId: dto.userId,
      tenantId: dto.tenantId,
      draftId: dto.draftId,
      messages: dto.messages
    });
  }

  @Post('roadmaps/drafts')
  async createRoadmapDraft(@Body() dto: CreateRoadmapDraftDto) {
    return this.gatewayFacade.createRoadmapDraft({
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

  @Get('roadmaps/drafts/:userId')
  async listRoadmapDrafts(@Param('userId') userId: string) {
    return this.gatewayFacade.listRoadmapDrafts(userId);
  }

  @Patch('roadmaps/drafts/:draftId/canvas')
  async updateRoadmapDraftCanvas(@Param('draftId') draftId: string, @Body() dto: UpdateRoadmapDraftCanvasDto) {
    return this.gatewayFacade.updateRoadmapDraftCanvas({
      draftId,
      userId: dto.userId,
      canvasViewport: dto.canvasViewport,
      roadmapNodes: dto.roadmapNodes
    });
  }

  @Get('lms/courses/:courseId')
  async getCourse(@Param('courseId') courseId: string) {
    return this.gatewayFacade.getCourse(courseId);
  }

  @Get('edu-tracker/progress/:userId')
  async getProgress(@Param('userId') userId: string) {
    return this.gatewayFacade.getLearningProgress(userId);
  }

  @Get('billing/subscription/:userId')
  async getSubscription(@Param('userId') userId: string) {
    return this.gatewayFacade.getActiveSubscription(userId);
  }

  @Get('analytics/kpi/:tenantId')
  async getKpi(@Param('tenantId') tenantId: string) {
    return this.gatewayFacade.getKpiSnapshot(tenantId);
  }
}
