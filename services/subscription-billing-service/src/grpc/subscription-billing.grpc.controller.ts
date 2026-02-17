import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SubscriptionBillingDomainService } from '../domain/subscription-billing.domain.service';

type CheckEntitlementRequest = {
  user_id: string;
  feature_key: string;
};

type GetActiveSubscriptionRequest = {
  user_id: string;
};

@Controller()
export class SubscriptionBillingGrpcController {
  constructor(private readonly billingDomainService: SubscriptionBillingDomainService) {}

  @GrpcMethod('SubscriptionBillingService', 'CheckEntitlement')
  async checkEntitlement(payload: CheckEntitlementRequest) {
    return this.billingDomainService.checkEntitlement(payload.user_id, payload.feature_key);
  }

  @GrpcMethod('SubscriptionBillingService', 'GetActiveSubscription')
  async getActiveSubscription(payload: GetActiveSubscriptionRequest) {
    return this.billingDomainService.getActiveSubscription(payload.user_id);
  }
}
