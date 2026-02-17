import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceAppModule, resolveProtoPath } from '@careeros/shared';
import { GatewayController } from './controllers/gateway.controller';
import { HealthController } from './controllers/health.controller';
import { GatewayFacade } from './domain/gateway.facade';

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
        name: 'AUTH_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.auth.v1',
            protoPath: resolveProtoPath('auth.proto'),
            url: config.getOrThrow<string>('AUTH_GRPC_URL'),
            loader: grpcLoader
          }
        })
      },
      {
        name: 'USER_PROFILE_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.userprofile.v1',
            protoPath: resolveProtoPath('user_profile.proto'),
            url: config.getOrThrow<string>('USER_PROFILE_GRPC_URL'),
            loader: grpcLoader
          }
        })
      },
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
      },
      {
        name: 'ROADMAP_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.roadmap.v1',
            protoPath: resolveProtoPath('roadmap.proto'),
            url: config.getOrThrow<string>('ROADMAP_GRPC_URL'),
            loader: grpcLoader
          }
        })
      },
      {
        name: 'LMS_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.lms.v1',
            protoPath: resolveProtoPath('lms.proto'),
            url: config.getOrThrow<string>('LMS_GRPC_URL'),
            loader: grpcLoader
          }
        })
      },
      {
        name: 'EDU_TRACKER_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.edutracker.v1',
            protoPath: resolveProtoPath('edu_tracker.proto'),
            url: config.getOrThrow<string>('EDU_TRACKER_GRPC_URL'),
            loader: grpcLoader
          }
        })
      },
      {
        name: 'BILLING_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.billing.v1',
            protoPath: resolveProtoPath('subscription_billing.proto'),
            url: config.getOrThrow<string>('BILLING_GRPC_URL'),
            loader: grpcLoader
          }
        })
      },
      {
        name: 'ANALYTICS_GRPC',
        imports: [ServiceAppModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'careeros.analytics.v1',
            protoPath: resolveProtoPath('analytics.proto'),
            url: config.getOrThrow<string>('ANALYTICS_GRPC_URL'),
            loader: grpcLoader
          }
        })
      }
    ])
  ],
  controllers: [HealthController, GatewayController],
  providers: [GatewayFacade]
})
export class ApiGatewayModule {}
