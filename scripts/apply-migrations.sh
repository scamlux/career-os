#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

apply_sql() {
  local db_url="$1"
  local sql_file="$2"
  echo "Applying ${sql_file}"
  psql "${db_url}" -f "${sql_file}"
}

apply_sql "${AUTH_DB_URL:-postgres://postgres:postgres@localhost:5433/auth}" "${ROOT_DIR}/database/auth/001_init.sql"
apply_sql "${USER_PROFILE_DB_URL:-postgres://postgres:postgres@localhost:5434/user_profile}" "${ROOT_DIR}/database/user-profile/001_init.sql"
apply_sql "${AI_CORE_DB_URL:-postgres://postgres:postgres@localhost:5435/ai_core}" "${ROOT_DIR}/database/ai-core/001_init.sql"
apply_sql "${ROADMAP_DB_URL:-postgres://postgres:postgres@localhost:5436/roadmap}" "${ROOT_DIR}/database/roadmap/001_init.sql"
apply_sql "${LMS_DB_URL:-postgres://postgres:postgres@localhost:5437/lms}" "${ROOT_DIR}/database/lms/001_init.sql"
apply_sql "${EDU_TRACKER_DB_URL:-postgres://postgres:postgres@localhost:5438/edu_tracker}" "${ROOT_DIR}/database/edu-tracker/001_init.sql"
apply_sql "${BILLING_DB_URL:-postgres://postgres:postgres@localhost:5439/billing}" "${ROOT_DIR}/database/subscription-billing/001_init.sql"
apply_sql "${ANALYTICS_DB_URL:-postgres://postgres:postgres@localhost:5440/analytics}" "${ROOT_DIR}/database/analytics/001_init.sql"

echo "All migrations applied."
