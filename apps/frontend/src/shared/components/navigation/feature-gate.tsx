'use client';

import { ReactNode } from 'react';
import { FeatureKey } from '@/shared/features/feature-gates';
import { useFeatureGate } from '@/shared/features/use-feature-gate';
import { FeatureLock } from '@/shared/components/ui/feature-lock';

export function FeatureGate({ feature, title, description, children }: { feature: FeatureKey; title: string; description: string; children: ReactNode }) {
  const unlocked = useFeatureGate(feature);

  return (
    <FeatureLock title={title} description={description} locked={!unlocked}>
      {children}
    </FeatureLock>
  );
}
