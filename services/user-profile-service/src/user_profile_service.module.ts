import { Module } from '@nestjs/common';
import { ServiceAppModule } from '@careeros/shared';
import { HealthController } from './controllers/health.controller';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileDomainService } from './domain/user-profile.domain.service';
import { UserProfileGrpcController } from './grpc/user-profile.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, UserProfileController, UserProfileGrpcController],
  providers: [UserProfileDomainService]
})
export class UserProfileServiceModule {}
