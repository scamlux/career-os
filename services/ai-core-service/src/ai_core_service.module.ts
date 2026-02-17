import { Module } from '@nestjs/common';
import { FeatureGateGuard, ServiceAppModule } from '@careeros/shared';
import { APP_GUARD } from '@nestjs/core';
import { AICoreController } from './controllers/ai-core.controller';
import { HealthController } from './controllers/health.controller';
import { AICoreDomainService } from './domain/ai-core.domain.service';
import { AICoreGrpcController } from './grpc/ai-core.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, AICoreController, AICoreGrpcController],
  providers: [
    AICoreDomainService,
    {
      provide: APP_GUARD,
      useClass: FeatureGateGuard
    }
  ]
})
export class AICoreServiceModule {}
