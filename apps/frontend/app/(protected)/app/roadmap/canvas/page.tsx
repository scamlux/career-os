import dynamic from 'next/dynamic';
import { PageShell } from '@/shared/components/ui/page-shell';

const CanvasView = dynamic(
  () => import('@/features/roadmap/components/roadmap-canvas-view').then((module) => module.RoadmapCanvasView),
  { ssr: false }
);

export default function RoadmapCanvasPage() {
  return (
    <PageShell title="Roadmap Canvas" subtitle="Pan, zoom, drag nodes and inspect AI suggestions in real-time.">
      <CanvasView />
    </PageShell>
  );
}
