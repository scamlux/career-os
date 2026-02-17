import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AnalyticsDomainService } from '../domain/analytics.domain.service';

type GetKpiSnapshotRequest = {
  tenant_id: string;
};

@Controller()
export class AnalyticsGrpcController {
  constructor(private readonly analyticsDomainService: AnalyticsDomainService) {}

  @GrpcMethod('AnalyticsService', 'GetKpiSnapshot')
  async getKpiSnapshot(payload: GetKpiSnapshotRequest) {
    return this.analyticsDomainService.getKpiSnapshot(payload.tenant_id);
  }
}
