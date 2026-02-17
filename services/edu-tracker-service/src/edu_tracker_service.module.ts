import { Module } from '@nestjs/common';
import { ServiceAppModule } from '@careeros/shared';
import { EduTrackerController } from './controllers/edu-tracker.controller';
import { HealthController } from './controllers/health.controller';
import { EduTrackerConsumer } from './domain/edu-tracker.consumer';
import { EduTrackerDomainService } from './domain/edu-tracker.domain.service';
import { EduTrackerGrpcController } from './grpc/edu-tracker.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, EduTrackerController, EduTrackerGrpcController],
  providers: [EduTrackerDomainService, EduTrackerConsumer]
})
export class EduTrackerServiceModule {}
