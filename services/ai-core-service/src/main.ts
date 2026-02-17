import { bootstrapHybridService } from '@careeros/shared';
import { AICoreServiceModule } from './ai_core_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'ai-core-service',
    moduleRef: AICoreServiceModule,
    protoFile: 'ai_core.proto',
    grpcPackage: 'careeros.aicore.v1'
  });
}

void main();
