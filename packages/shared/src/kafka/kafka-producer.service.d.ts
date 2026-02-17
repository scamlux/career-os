import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEnvelope } from '../types/event-envelope';
export declare class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private producer?;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publish<T>(topic: string, envelope: EventEnvelope<T>): Promise<void>;
}
