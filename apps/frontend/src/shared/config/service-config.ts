import { ServiceKey } from '@/shared/types/app';

export const serviceBaseMap: Record<ServiceKey, string> = {
  gateway: process.env.NEXT_PUBLIC_GATEWAY_URL ?? '/api/gateway',
  auth: process.env.NEXT_PUBLIC_AUTH_URL ?? '/api/auth',
  profile: process.env.NEXT_PUBLIC_PROFILE_URL ?? '/api/profile',
  ai_core: process.env.NEXT_PUBLIC_AI_CORE_URL ?? '/api/ai-core',
  roadmap: process.env.NEXT_PUBLIC_ROADMAP_URL ?? '/api/roadmap',
  lms: process.env.NEXT_PUBLIC_LMS_URL ?? '/api/lms',
  edu_tracker: process.env.NEXT_PUBLIC_EDU_TRACKER_URL ?? '/api/edu-tracker',
  billing: process.env.NEXT_PUBLIC_BILLING_URL ?? '/api/billing',
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_URL ?? '/api/analytics'
};
