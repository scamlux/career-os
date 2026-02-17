# Local Runbook

## Prerequisites
- Node.js 20+
- Docker + Docker Compose
- psql CLI (for migration script)

## Install
```bash
npm install
```

## Start Infrastructure + Services
```bash
docker compose -f infra/docker/docker-compose.local.yml up --build -d
```

## Apply Migrations
```bash
./scripts/apply-migrations.sh
```

## API Entry Point
- Gateway URL: `http://localhost:8080`
- Health: `http://localhost:8080/health`
- Versioned API base: `http://localhost:8080/v1`

## Example Smoke Calls
```bash
curl http://localhost:8080/v1/profiles/test-user

curl -X POST http://localhost:8080/v1/ai/flows/execute \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "user-1",
    "tenantId": "tenant-1",
    "flowName": "roadmap_generator",
    "input": {"goal": "Backend Engineer"}
  }'
```

## Manual Service Startup (Optional)
Use separate terminals and set per-service env variables (`DATABASE_URL`, `GRPC_PORT`, `HTTP_PORT`, `KAFKA_BROKERS`, `SERVICE_SHARED_SECRET`).

Examples:
```bash
npm run dev:auth
npm run dev:ai-core
npm run dev:api-gateway
```
