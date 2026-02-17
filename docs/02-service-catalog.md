# Service Catalog

## 1) Auth Service
Responsibilities:
- Registration/login
- JWT + refresh tokens
- Session management
- RBAC (roles/permissions)
- OAuth provider linking (future)

Sync dependencies:
- Subscription Billing (feature entitlement checks via gRPC)

Published events:
- `UserRegistered`
- `UserLoggedIn`
- `RoleChanged`

## 2) User Profile Service
Responsibilities:
- Extended profile
- Skill matrix and experience history
- CV metadata and document references

Published events:
- `ProfileUpdated`
- `SkillsUpdated`
- `DocumentUploaded`

## 3) AI Core Service
Responsibilities:
- AI Flow orchestration
- Resume analysis
- Skill gap analysis
- Roadmap generation support
- Interview simulation
- Productivity advisory

Published events:
- `AIFlowExecuted`
- `SkillGapAnalyzed`
- `RoadmapDraftGenerated`

## 4) Roadmap Service
Responsibilities:
- Career goals and roadmap lifecycle
- Versioning and editable roadmap states
- Milestone tracking
- Timeline recalculation

Published events:
- `RoadmapCreated`
- `RoadmapUpdated`
- `MilestoneCompleted`

## 5) LMS Service
Responsibilities:
- Course catalog and delivery
- Quiz and assignment engines
- Grading and certification
- Instructor dashboards and revenue split

Published events:
- `LessonCompleted`
- `QuizSubmitted`
- `CourseCompleted`
- `CertificateIssued`

## 6) Edu-Tracker Service
Responsibilities:
- Learning progress aggregation
- Mastery score computation
- Streak and productivity scoring
- Performance prediction

Consumes:
- LMS and Roadmap events

Published events:
- `MasteryScoreUpdated`
- `StreakUpdated`
- `ProductivityScoreComputed`

## 7) Subscription & Billing Service
Responsibilities:
- Plan and entitlement management
- Subscription lifecycle
- Invoicing
- B2B organization billing
- Payment webhooks

Published events:
- `SubscriptionActivated`
- `SubscriptionRenewed`
- `SubscriptionCanceled`
- `InvoicePaid`

## 8) Analytics Service
Responsibilities:
- KPI, funnel, and churn analytics
- AI usage and cost analytics
- Product and tenant reporting

Consumes events from all services.
