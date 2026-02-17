import { Module } from '@nestjs/common';
import { ServiceAppModule } from '@careeros/shared';
import { AuthController } from './controllers/auth.controller';
import { HealthController } from './controllers/health.controller';
import { AuthDomainService } from './domain/auth.domain.service';
import { AuthGrpcController } from './grpc/auth.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, AuthController, AuthGrpcController],
  providers: [AuthDomainService]
})
export class AuthServiceModule {}
