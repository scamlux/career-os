import { Module } from '@nestjs/common';
import { ServiceAppModule } from '@careeros/shared';
import { HealthController } from './controllers/health.controller';
import { SubscriptionBillingController } from './controllers/subscription-billing.controller';
import { SubscriptionBillingDomainService } from './domain/subscription-billing.domain.service';
import { SubscriptionBillingGrpcController } from './grpc/subscription-billing.grpc.controller';

@Module({
  imports: [ServiceAppModule],
  controllers: [HealthController, SubscriptionBillingController, SubscriptionBillingGrpcController],
  providers: [SubscriptionBillingDomainService]
})
export class SubscriptionBillingServiceModule {}
