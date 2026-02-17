import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryResult, QueryResultRow } from 'pg';
export declare class PostgresService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private pool?;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}
