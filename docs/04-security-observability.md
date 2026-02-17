# Security and Observability

## Security Controls
- JWT access token + rotating refresh tokens
- RBAC with permission policies from Auth service
- Service-to-service auth via mTLS-ready service mesh
- Rate limits at gateway and AI endpoints
- File scanning and MIME/type/size validation for uploads
- Tenant isolation checks in every query path
- GDPR-ready deletion workflow with anonymization and tombstone events

## Abuse Protection for AI
- Per-user and per-tenant quota buckets
- Prompt injection detection and input sanitization
- Sensitive data redaction before model call
- Moderation checks on prompt and output

## Audit and Compliance
- Audit trails for auth changes, billing changes, AI executions, data deletion requests
- Soft deletes on user-owned records
- Data retention policy with configurable TTL by domain

## Observability Stack
- OpenTelemetry SDK in every service
- Prometheus scraping service and infra metrics
- Grafana dashboards: API latency, event lag, AI cost, error budget
- ELK/OpenSearch centralized logging with structured JSON logs
- Alerting via Alertmanager with SLO policies
