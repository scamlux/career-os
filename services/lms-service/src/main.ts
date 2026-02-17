import { bootstrapHybridService } from '@careeros/shared';
import { LmsServiceModule } from './lms_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'lms-service',
    moduleRef: LmsServiceModule,
    protoFile: 'lms.proto',
    grpcPackage: 'careeros.lms.v1'
  });
}

void main();
