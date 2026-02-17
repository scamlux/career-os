'use client';

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/http-client';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { useAppStore } from '@/shared/store/app-store';

export function RoadmapListView() {
  const userId = useAppStore((state) => state.userId);

  const roadmapQuery = useQuery({
    queryKey: ['roadmap', 'active', userId],
    queryFn: () => apiRequest<{ roadmap_id: string; status: string; version: number }>('gateway', `/v1/roadmaps/active/${userId}`),
    enabled: Boolean(userId)
  });

  if (!roadmapQuery.data?.roadmap_id) {
    return <EmptyState title="No roadmap yet" description="Generate one from onboarding or AI assistant." />;
  }

  return (
    <div className="panel space-y-3">
      <h3 className="text-sm font-semibold text-text">Roadmap List View</h3>
      <div className="rounded-lg border border-line bg-bg p-3 text-sm text-muted">
        <p>Roadmap ID: <span className="font-semibold text-text">{roadmapQuery.data.roadmap_id}</span></p>
        <p>Status: <span className="font-semibold text-text">{roadmapQuery.data.status}</span></p>
        <p>Version: <span className="font-semibold text-text">{roadmapQuery.data.version}</span></p>
      </div>
      <div className="flex gap-2">
        <Button>Regenerate stage</Button>
        <Button variant="ghost">Edit timeline</Button>
      </div>
    </div>
  );
}
