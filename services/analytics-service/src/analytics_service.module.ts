import { Module } from '@nestjs/common';
import { ServiceAppModule } from '@careeros/shared';
import { AnalyticsController } from './controllers/analytics.controller';
import { HealthController } from './controllers/health.controller';
import { AnalyticsConsumer } from './domain/analytics.consumer';
import { AnalyticsDomainService } from './domain/analytics.domain.service';
import { AnalyticsGrpcController } from './grpc/analytics.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, AnalyticsController, AnalyticsGrpcController],
  providers: [AnalyticsDomainService, AnalyticsConsumer]
})
export class AnalyticsServiceModule {}
