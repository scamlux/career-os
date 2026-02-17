import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';

const { Pool } = pg;

const targets = [
  { name: 'auth', dbUrl: process.env.AUTH_DB_URL ?? 'postgres://postgres:postgres@localhost:5433/auth', sqlFile: 'database/auth/001_init.sql' },
  { name: 'user_profile', dbUrl: process.env.USER_PROFILE_DB_URL ?? 'postgres://postgres:postgres@localhost:5434/user_profile', sqlFile: 'database/user-profile/001_init.sql' },
  { name: 'ai_core', dbUrl: process.env.AI_CORE_DB_URL ?? 'postgres://postgres:postgres@localhost:5435/ai_core', sqlFile: 'database/ai-core/001_init.sql' },
  { name: 'roadmap', dbUrl: process.env.ROADMAP_DB_URL ?? 'postgres://postgres:postgres@localhost:5436/roadmap', sqlFile: 'database/roadmap/001_init.sql' },
  { name: 'lms', dbUrl: process.env.LMS_DB_URL ?? 'postgres://postgres:postgres@localhost:5437/lms', sqlFile: 'database/lms/001_init.sql' },
  { name: 'edu_tracker', dbUrl: process.env.EDU_TRACKER_DB_URL ?? 'postgres://postgres:postgres@localhost:5438/edu_tracker', sqlFile: 'database/edu-tracker/001_init.sql' },
  { name: 'billing', dbUrl: process.env.BILLING_DB_URL ?? 'postgres://postgres:postgres@localhost:5439/billing', sqlFile: 'database/subscription-billing/001_init.sql' },
  { name: 'analytics', dbUrl: process.env.ANALYTICS_DB_URL ?? 'postgres://postgres:postgres@localhost:5440/analytics', sqlFile: 'database/analytics/001_init.sql' }
];

async function sleep(ms) {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function waitForDb(pool, name) {
  const timeoutMs = 90000;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch {
      await sleep(1000);
    }
  }
  throw new Error(`Database '${name}' is not ready after ${timeoutMs}ms`);
}

async function applyTarget(target) {
  const pool = new Pool({ connectionString: target.dbUrl });
  try {
    await waitForDb(pool, target.name);
    const sql = await readFile(resolve(process.cwd(), target.sqlFile), 'utf8');
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await pool.query('CREATE SCHEMA public;');
    await pool.query(sql);
    console.log(`[migrate] ${target.name} OK`);
  } finally {
    await pool.end();
  }
}

for (const target of targets) {
  await applyTarget(target);
}
console.log('[migrate] all databases migrated');
