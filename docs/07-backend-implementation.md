# Backend Implementation Scaffold (Phase 1)

This document tracks what has been implemented as executable backend scaffold code.

## Monorepo Runtime
- Root workspace with shared dependencies and build scripts.
- Shared module (`packages/shared`) provides:
  - env validation
  - Nest bootstrap (HTTP + Hybrid HTTP/gRPC)
  - correlation middleware
  - request logging interceptor
  - Kafka producer
  - PostgreSQL connectivity module

## Implemented Services
- API Gateway:
  - REST API (`/v1/*`)
  - gRPC clients to all internal services
  - entitlement check before AI flow execution
- Auth Service:
  - register/login/refresh REST endpoints
  - JWT + refresh session persistence
  - gRPC token validation and permission lookup
  - auth domain events to Kafka
- User Profile Service:
  - profile and skill matrix management
  - gRPC profile and skill matrix queries
  - profile update events
- AI Core Service:
  - AI Flow Engine scaffold with flow registry
  - output schema field validation
  - fallback model strategy
  - token usage and cost tracking persistence
  - `AIFlowExecuted` event publication
- Roadmap Service:
  - roadmap creation/version baseline
  - timeline recalculation
  - milestone completion events
- LMS Service:
  - course creation/publish
  - enrollment and lesson completion events
  - gRPC course and enrollment lookup
- Edu-Tracker Service:
  - Kafka consumer for LMS/Roadmap events
  - mastery/productivity recomputation
  - gRPC learning progress endpoint
- Subscription & Billing Service:
  - plan creation
  - subscription activation/webhook handling
  - entitlement checks and active subscription gRPC APIs
- Analytics Service:
  - global Kafka consumer
  - funnel + AI usage aggregation
  - KPI snapshot gRPC API

## DevOps Assets
- Dockerfiles for each service.
- Local compose stack for infra + service containers.
- Kubernetes base manifests with Deployments, Services, HPAs.
- migration runner: `scripts/apply-migrations.sh`.

## Current Limitation in This Environment
Dependency installation is blocked in sandbox (npm registry DNS `ENOTFOUND`), so compile/runtime validation was not executable here.
