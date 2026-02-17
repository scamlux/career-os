import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsDomainService } from '../domain/analytics.domain.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsDomainService: AnalyticsDomainService) {}

  @Get('kpi/:tenantId')
  async getKpiSnapshot(@Param('tenantId') tenantId: string) {
    return this.analyticsDomainService.getKpiSnapshot(tenantId);
  }
}
