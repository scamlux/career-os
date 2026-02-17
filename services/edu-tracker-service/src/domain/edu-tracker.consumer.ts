import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { EduTrackerDomainService } from './edu-tracker.domain.service';

type EventEnvelope = {
  event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  user_id?: string;
};

@Injectable()
export class EduTrackerConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EduTrackerConsumer.name);
  private consumer?: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly trackerDomainService: EduTrackerDomainService
  ) {}

  async onModuleInit(): Promise<void> {
    const brokers = this.configService.getOrThrow<string>('KAFKA_BROKERS').split(',');
    const clientId = `${this.configService.getOrThrow<string>('KAFKA_CLIENT_ID')}-edu-tracker`;

    const kafka = new Kafka({ brokers, clientId });
    this.consumer = kafka.consumer({ groupId: 'edutracker-lms-progress-v1' });

    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'careeros.lms.lesson-completed.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'careeros.roadmap.milestone-completed.v1', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const raw = message.value?.toString();
        if (!raw) {
          return;
        }

        const event = this.safeParse(raw);
        if (!event) {
          this.logger.warn('Skipping malformed event');
          return;
        }

        if (event.event_type === 'LessonCompleted') {
          const userId = (event.payload['user_id'] as string | undefined) ?? event.user_id;
          if (!userId) {
            return;
          }

          await this.trackerDomainService.ingestLessonCompleted({
            eventId: event.event_id,
            userId,
            courseId: String(event.payload['course_id'] ?? ''),
            lessonId: String(event.payload['lesson_id'] ?? ''),
            timeSpentMinutes: Number(event.payload['time_spent_minutes'] ?? 0)
          });
        }

        if (event.event_type === 'MilestoneCompleted') {
          const userId = (event.payload['user_id'] as string | undefined) ?? event.user_id;
          if (!userId) {
            return;
          }

          await this.trackerDomainService.ingestMilestoneCompleted({
            eventId: event.event_id,
            userId,
            milestoneId: String(event.payload['milestone_id'] ?? '')
          });
        }
      }
    });

    this.logger.log('EduTracker Kafka consumer started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }

  private safeParse(raw: string): EventEnvelope | null {
    try {
      const parsed = JSON.parse(raw) as EventEnvelope;
      return parsed;
    } catch {
      return null;
    }
  }
}
