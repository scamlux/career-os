import { Module } from '@nestjs/common';
import { ServiceAppModule } from '@careeros/shared';
import { HealthController } from './controllers/health.controller';
import { LmsController } from './controllers/lms.controller';
import { LmsDomainService } from './domain/lms.domain.service';
import { LmsGrpcController } from './grpc/lms.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, LmsController, LmsGrpcController],
  providers: [LmsDomainService]
})
export class LmsServiceModule {}
