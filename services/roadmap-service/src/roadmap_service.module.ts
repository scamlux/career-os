import { Module } from '@nestjs/common';
import { ServiceAppModule } from '@careeros/shared';
import { HealthController } from './controllers/health.controller';
import { RoadmapController } from './controllers/roadmap.controller';
import { RoadmapDomainService } from './domain/roadmap.domain.service';
import { RoadmapGrpcController } from './grpc/roadmap.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, RoadmapController, RoadmapGrpcController],
  providers: [RoadmapDomainService]
})
export class RoadmapServiceModule {}
