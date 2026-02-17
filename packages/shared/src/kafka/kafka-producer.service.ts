import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, logLevel } from 'kafkajs';
import { EventEnvelope } from '../types/event-envelope';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer?: Producer;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const brokers = this.configService.getOrThrow<string>('KAFKA_BROKERS').split(',');
    const clientId = this.configService.getOrThrow<string>('KAFKA_CLIENT_ID');
    const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.INFO });

    this.producer = kafka.producer();
    await this.connectWithRetry();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async publish<T>(topic: string, envelope: EventEnvelope<T>): Promise<void> {
    if (!this.producer) {
      throw new Error('Kafka producer is not initialized');
    }

    await this.producer.send({
      topic,
      messages: [
        {
          key: envelope.tenant_id,
          value: JSON.stringify(envelope),
          headers: {
            event_type: envelope.event_type,
            event_version: envelope.event_version.toString()
          }
        }
      ]
    });
  }

  private async connectWithRetry(): Promise<void> {
    if (!this.producer) {
      throw new Error('Kafka producer is not initialized');
    }

    const maxAttempts = 40;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.producer.connect();
        return;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown error';
        this.logger.warn(`Kafka not ready (attempt ${attempt}/${maxAttempts}): ${message}`);
        await this.sleep(1500);
      }
    }

    throw new Error('Kafka is not reachable after multiple attempts');
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise<void>((resolvePromise) => {
      setTimeout(resolvePromise, ms);
    });
  }
}
