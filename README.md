# CareerOS AI Platform (Microservices Monorepo)

Production-oriented Phase 1 backend scaffold for an AI-native Career Operating System.

## Included Domains
- AI-HR Consult Engine
- Personalized Career Roadmap Engine
- Edu-Tracker Analytics Engine
- LMS Platform (multi-instructor)
- Subscription & Billing
- B2B multi-tenant support primitives

## Architecture
- API Gateway: REST ingress
- Internal sync communication: gRPC
- Async/event-driven communication: Kafka
- Data isolation: PostgreSQL database per service
- Redis: cache/session/rate-limit support
- Object storage-ready: S3-compatible adapters (integration point)
- Observability: OTEL-ready hooks + Prometheus/Grafana + ELK stack in local compose
- Deployment: Docker + Kubernetes manifests

Primary architecture docs:
- `/Users/muhammadumar/Desktop/career-os/docs/01-system-architecture.md`
- `/Users/muhammadumar/Desktop/career-os/docs/03-ai-orchestration.md`

## Services
- `apps/frontend` (Next.js App Router frontend with RBAC, feature gating, AI streaming, and canvas roadmap engine)
- `services/api-gateway`
- `services/auth-service`
- `services/user-profile-service`
- `services/ai-core-service`
- `services/roadmap-service`
- `services/lms-service`
- `services/edu-tracker-service`
- `services/subscription-billing-service`
- `services/analytics-service`

## Contracts
- gRPC proto contracts: `/Users/muhammadumar/Desktop/career-os/contracts/grpc`
- Event schemas: `/Users/muhammadumar/Desktop/career-os/contracts/events`

## Local Run (Phase 1)
1. Install dependencies:
```bash
npm install
```
2. Start infra and services with Docker Compose:
```bash
docker compose -f infra/docker/docker-compose.local.yml up --build -d
```
3. Apply DB migrations:
```bash
./scripts/apply-migrations.sh
```
4. API Gateway endpoint:
- `http://localhost:8080/v1/health`

## Frontend (AI-Native Web App)
1. Install dependencies:
```bash
npm install
```
2. Run frontend:
```bash
npm run dev:frontend
```
3. Open:
- `http://localhost:3001`

Frontend proxy routes are preconfigured to local services (`8080-8088`) through Next rewrites, so no CORS configuration is required for local development.
If needed, override endpoints via `/Users/muhammadumar/Desktop/career-os/apps/frontend/.env.example`.

### Service Mode Switching UX
- Floating top-center mode switcher: `AI-HR / Roadmap / Courses`
- Mode switching does not reload the page and preserves mode state:
  - AI sessions/history
  - Roadmap canvas context and discovery answers
  - Active/enrolled courses and tracking progress
- Always-on AI helper button is available in all modes.

## Run Services Manually (without containerized app layer)
- Start infra only from compose (Kafka/Postgres/Redis).
- Run one service:
```bash
npm run dev:auth
```
- Build all:
```bash
npm run build
```

## Event Topics (Examples)
- `careeros.auth.user-registered.v1`
- `careeros.roadmap.roadmap-created.v1`
- `careeros.lms.lesson-completed.v1`
- `careeros.billing.subscription-activated.v1`
- `careeros.ai.ai-flow-executed.v1`

## Phase Plan
1. Phase 1: monorepo + separated services (current)
2. Phase 2: independent deployments and CI/CD lanes
3. Phase 3: multi-region
4. Phase 4: AI agent autonomy layer
