export type EventEnvelope<TPayload = Record<string, unknown>> = {
    event_id: string;
    event_type: string;
    event_version: number;
    occurred_at: string;
    source: string;
    correlation_id?: string;
    request_id?: string;
    tenant_id: string;
    user_id?: string;
    payload: TPayload;
};
