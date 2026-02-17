import { bootstrapHybridService } from '@careeros/shared';
import { SubscriptionBillingServiceModule } from './subscription_billing_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'subscription-billing-service',
    moduleRef: SubscriptionBillingServiceModule,
    protoFile: 'subscription_billing.proto',
    grpcPackage: 'careeros.billing.v1'
  });
}

void main();
