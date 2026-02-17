'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/http-client';
import { useAppStore } from '@/shared/store/app-store';

export function useDashboardData() {
  const userId = useAppStore((state) => state.userId);
  const tenantId = useAppStore((state) => state.tenantId);

  const roadmap = useQuery({
    queryKey: ['dashboard', 'roadmap', userId],
    queryFn: () => apiRequest<{ roadmap_id: string; version: number; status: string }>('gateway', `/v1/roadmaps/active/${userId}`),
    enabled: Boolean(userId)
  });

  const progress = useQuery({
    queryKey: ['dashboard', 'progress', userId],
    queryFn: () =>
      apiRequest<{
        mastery_score: number;
        streak_days: number;
        minutes_this_week: number;
        productivity_score: number;
      }>('gateway', `/v1/edu-tracker/progress/${userId}`),
    enabled: Boolean(userId)
  });

  const analytics = useQuery({
    queryKey: ['dashboard', 'analytics', tenantId],
    queryFn: () =>
      apiRequest<{
        dau: number;
        wau: number;
        churn_risk_score: number;
        mrr_usd: number;
      }>('gateway', `/v1/analytics/kpi/${tenantId}`),
    enabled: Boolean(tenantId)
  });

  return { roadmap, progress, analytics };
}
