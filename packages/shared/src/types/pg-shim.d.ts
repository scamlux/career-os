declare module 'pg' {
  export interface QueryResultRow {
    [column: string]: unknown;
  }

  export interface QueryResult<T extends QueryResultRow = QueryResultRow> {
    rows: T[];
    rowCount: number;
  }

  export class Pool {
    constructor(config: { connectionString: string; max?: number; idleTimeoutMillis?: number });
    query<T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
