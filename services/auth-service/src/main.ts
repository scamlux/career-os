import { bootstrapHybridService } from '@careeros/shared';
import { AuthServiceModule } from './auth_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'auth-service',
    moduleRef: AuthServiceModule,
    protoFile: 'auth.proto',
    grpcPackage: 'careeros.auth.v1'
  });
}

void main();
