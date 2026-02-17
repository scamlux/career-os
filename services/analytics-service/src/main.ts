import { bootstrapHybridService } from '@careeros/shared';
import { AnalyticsServiceModule } from './analytics_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'analytics-service',
    moduleRef: AnalyticsServiceModule,
    protoFile: 'analytics.proto',
    grpcPackage: 'careeros.analytics.v1'
  });
}

void main();
