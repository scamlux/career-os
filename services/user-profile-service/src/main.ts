import { bootstrapHybridService } from '@careeros/shared';
import { UserProfileServiceModule } from './user_profile_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'user-profile-service',
    moduleRef: UserProfileServiceModule,
    protoFile: 'user_profile.proto',
    grpcPackage: 'careeros.userprofile.v1'
  });
}

void main();
