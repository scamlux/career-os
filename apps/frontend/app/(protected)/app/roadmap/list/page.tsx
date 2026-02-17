import { PageShell } from '@/shared/components/ui/page-shell';
import { RoadmapListView } from '@/features/roadmap/components/roadmap-list-view';

export default function RoadmapListPage() {
  return (
    <PageShell title="Roadmap List" subtitle="Structured roadmap stages with quick actions.">
      <RoadmapListView />
    </PageShell>
  );
}
