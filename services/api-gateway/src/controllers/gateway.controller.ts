import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GatewayFacade } from '../domain/gateway.facade';
import { GatewayExecuteFlowDto } from '../dto/execute-flow.dto';
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

  @Get('roadmaps/active/:userId')
  async getActiveRoadmap(@Param('userId') userId: string) {
    return this.gatewayFacade.getActiveRoadmap(userId);
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
