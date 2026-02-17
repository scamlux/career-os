import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { AnalyticsDomainService } from './analytics.domain.service';

type EventEnvelope = {
  event_id: string;
  event_type: string;
  tenant_id: string;
  user_id?: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class AnalyticsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsConsumer.name);
  private consumer?: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly analyticsDomainService: AnalyticsDomainService
  ) {}

  async onModuleInit(): Promise<void> {
    const brokers = this.configService.getOrThrow<string>('KAFKA_BROKERS').split(',');
    const clientId = `${this.configService.getOrThrow<string>('KAFKA_CLIENT_ID')}-analytics`;
    const kafka = new Kafka({ brokers, clientId });

    this.consumer = kafka.consumer({ groupId: 'analytics-global-v1' });

    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'careeros.auth.user-registered.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'careeros.roadmap.roadmap-created.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'careeros.lms.lesson-completed.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'careeros.billing.subscription-activated.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'careeros.ai.ai-flow-executed.v1', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const raw = message.value?.toString();
        if (!raw) {
          return;
        }

        const event = this.safeParse(raw);
        if (!event) {
          return;
        }

        await this.analyticsDomainService.ingestEvent(event);
      }
    });

    this.logger.log('Analytics Kafka consumer started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }

  private safeParse(raw: string): EventEnvelope | null {
    try {
      const parsed = JSON.parse(raw) as EventEnvelope;
      if (!parsed.event_id || !parsed.event_type || !parsed.tenant_id) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
