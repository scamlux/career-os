import Link from 'next/link';
import { PageShell } from '@/shared/components/ui/page-shell';
import { Button } from '@/shared/components/ui/button';

export default function RoadmapIndexPage() {
  return (
    <PageShell title="Roadmap" subtitle="Switch between canvas interaction and structured list mode.">
      <div className="flex gap-2">
        <Link href="/app/roadmap/canvas">
          <Button>Canvas View</Button>
        </Link>
        <Link href="/app/roadmap/list">
          <Button variant="ghost">List View</Button>
        </Link>
      </div>
    </PageShell>
  );
}
