import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private pool?: Pool;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const connectionString = this.configService.getOrThrow<string>('DATABASE_URL');
    this.pool = new Pool({ connectionString, max: 20, idleTimeoutMillis: 30000 });
    await this.waitForPostgres();
    this.logger.log('PostgreSQL connection established');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool is not initialized');
    }

    return this.pool.query<T>(sql, params);
  }

  private async waitForPostgres(): Promise<void> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool is not initialized');
    }

    const maxAttempts = 40;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.pool.query('SELECT 1');
        return;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown error';
        this.logger.warn(`PostgreSQL not ready (attempt ${attempt}/${maxAttempts}): ${message}`);
        await this.sleep(1500);
      }
    }

    throw new Error('PostgreSQL is not reachable after multiple attempts');
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise<void>((resolvePromise) => {
      setTimeout(resolvePromise, ms);
    });
  }
}
