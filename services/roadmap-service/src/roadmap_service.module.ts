import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceAppModule, resolveProtoPath } from '@careeros/shared';
import { HealthController } from './controllers/health.controller';
import { RoadmapController } from './controllers/roadmap.controller';
import { RoadmapDomainService } from './domain/roadmap.domain.service';
import { RoadmapGrpcController } from './grpc/roadmap.grpc.controller';

const grpcLoader = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

@Module({
  imports: [
    ServiceAppModule,
    ClientsModule.registerAsync([
      {
        name: 'AI_CORE_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.aicore.v1',
            protoPath: resolveProtoPath('ai_core.proto'),
            url: config.getOrThrow<string>('AI_CORE_GRPC_URL'),
            loader: grpcLoader
          }
        })
      }
    ])
  ],
  controllers: [HealthController, RoadmapController, RoadmapGrpcController],
  providers: [RoadmapDomainService]
})
export class RoadmapServiceModule {}
