import { bootstrapHybridService } from '@careeros/shared';
import { EduTrackerServiceModule } from './edu_tracker_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'edu-tracker-service',
    moduleRef: EduTrackerServiceModule,
    protoFile: 'edu_tracker.proto',
    grpcPackage: 'careeros.edutracker.v1'
  });
}

void main();
