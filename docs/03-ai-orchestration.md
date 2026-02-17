# AI Orchestration Design

## AI Flow Engine Pattern
Each AI capability is a versioned flow definition with:
- input schema
- prompt template version
- model routing policy
- output schema
- retry and fallback policy
- post-process and validation hooks

## Flow Lifecycle
1. Receive request (`flow_name`, `input`, `user_id`, `tenant_id`)
2. Validate input schema
3. Resolve active flow version and prompt version
4. Apply policy checks (plan limits, abuse checks, rate limits)
5. Execute model call
6. Validate structured JSON output
7. Persist outputs + token/cost usage
8. Emit `AIFlowExecuted`

## Validation Layers
- JSON schema validation (hard fail)
- Business rule validation (soft/hard fail by flow)
- Safety filters (toxicity/abuse checks)
- Deterministic normalizer for downstream services

## Retry/Fallback
- Retry transient model/API failures with exponential backoff
- Fallback chain: primary model -> backup model -> minimal deterministic response
- Mark execution status: `SUCCESS`, `PARTIAL`, `FAILED`

## Cost Tracking
- Track prompt tokens, completion tokens, model unit price, and latency per request
- Aggregate by `tenant_id`, `user_id`, `flow_name`, `flow_version`
- Enforce plan-based quotas in billing entitlement middleware

## Output Contract Requirement
Every AI flow returns:
- `flow_execution_id`
- `flow_name`
- `flow_version`
- `output_schema_version`
- `result` (strict JSON object)
- `confidence`
- `warnings`
