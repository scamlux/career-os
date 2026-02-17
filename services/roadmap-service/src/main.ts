import { bootstrapHybridService } from '@careeros/shared';
import { RoadmapServiceModule } from './roadmap_service.module';

async function main(): Promise<void> {
  await bootstrapHybridService({
    serviceName: 'roadmap-service',
    moduleRef: RoadmapServiceModule,
    protoFile: 'roadmap.proto',
    grpcPackage: 'careeros.roadmap.v1'
  });
}

void main();
