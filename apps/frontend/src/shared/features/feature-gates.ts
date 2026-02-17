import { AppRole, SubscriptionPlan } from '@/shared/types/rbac';

export type FeatureKey =
  | 'ai_chat'
  | 'ai_resume_analysis'
  | 'ai_interview_simulation'
  | 'roadmap_regeneration'
  | 'advanced_analytics'
  | 'team_dashboard'
  | 'course_builder'
  | 'admin_tools';

type GateRule = {
  minPlan?: SubscriptionPlan;
  roles?: AppRole[];
};

const planRank: Record<SubscriptionPlan, number> = {
  free: 0,
  premium: 1,
  team: 2,
  enterprise: 3
};

export const featureRules: Record<FeatureKey, GateRule> = {
  ai_chat: { minPlan: 'free' },
  ai_resume_analysis: { minPlan: 'premium' },
  ai_interview_simulation: { minPlan: 'premium' },
  roadmap_regeneration: { minPlan: 'premium' },
  advanced_analytics: { minPlan: 'premium' },
  team_dashboard: { minPlan: 'team', roles: ['org_admin', 'admin'] },
  course_builder: { roles: ['instructor', 'admin'] },
  admin_tools: { roles: ['admin'] }
};

export function canUseFeature(feature: FeatureKey, role: AppRole, plan: SubscriptionPlan, flags: Partial<Record<FeatureKey, boolean>>) {
  if (flags[feature] === false) {
    return false;
  }

  if (flags[feature] === true) {
    return true;
  }

  const rule = featureRules[feature];
  if (!rule) {
    return true;
  }

  if (rule.roles && !rule.roles.includes(role)) {
    return false;
  }

  if (rule.minPlan && planRank[plan] < planRank[rule.minPlan]) {
    return false;
  }

  return true;
}
