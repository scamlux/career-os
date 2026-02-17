'use client';

import { FeatureKey, canUseFeature } from '@/shared/features/feature-gates';
import { useAppStore } from '@/shared/store/app-store';

export function useFeatureGate(feature: FeatureKey) {
  const { role, plan, featureFlags } = useAppStore((state) => ({
    role: state.role,
    plan: state.plan,
    featureFlags: state.featureFlags
  }));

  return canUseFeature(feature, role, plan, featureFlags);
}
