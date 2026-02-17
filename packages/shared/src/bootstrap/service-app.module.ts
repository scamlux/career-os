import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SharedConfigModule } from '../config/config.module';
import { PostgresModule } from '../database/postgres.module';
import { CorrelationIdMiddleware } from '../middleware/correlation-id.middleware';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    SharedConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL ?? 60),
        limit: Number(process.env.THROTTLE_LIMIT ?? 120)
      }
    ]),
    PostgresModule,
    KafkaModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
  exports: [SharedConfigModule, ThrottlerModule, KafkaModule]
})
export class ServiceAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
