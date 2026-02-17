# Event Topology and Plan Gating

## Kafka Topic Convention
- `careeros.auth.user-registered.v1`
- `careeros.roadmap.roadmap-created.v1`
- `careeros.lms.lesson-completed.v1`
- `careeros.billing.subscription-activated.v1`
- `careeros.ai.ai-flow-executed.v1`

## Consumer Groups
- Edu-Tracker: `edutracker-lms-progress-v1`
- Analytics: `analytics-global-v1`
- Roadmap updates from AI: `roadmap-ai-updates-v1`
- Billing entitlement projections: `billing-usage-v1`

## Plan Feature Matrix
- Freemium:
  - AI usage capped monthly
  - one active roadmap
  - basic analytics only
- Premium:
  - high AI quota
  - advanced analytics
  - interview simulation
- Enterprise:
  - organization accounts and admin controls
  - tenant-level dashboards
  - custom AI flow configurations

## Feature Gating Design
- Gateway and service-level checks call `SubscriptionBillingService.CheckEntitlement`.
- Gating key examples:
  - `ai.flow.execute`
  - `roadmap.regenerate`
  - `analytics.advanced`
  - `lms.instructor.revenue_dashboard`

## Idempotency and Ordering
- Producer uses outbox and event key = aggregate id.
- Consumers store processed event IDs to avoid double apply.
- Ordering required within aggregate streams (user, roadmap, subscription).
