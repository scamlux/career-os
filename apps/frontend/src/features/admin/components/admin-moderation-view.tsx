import { RoleGuard } from '@/shared/components/navigation/role-guard';
import { Button } from '@/shared/components/ui/button';
import { PageShell } from '@/shared/components/ui/page-shell';

export function AdminModerationView() {
  return (
    <RoleGuard roles={['admin']}>
      <PageShell title="Moderation" subtitle="Review flagged AI outputs and course content.">
        <div className="panel space-y-3 text-sm text-muted">
          <p>Flag #ai-1021: Potential harmful recommendation in interview simulation.</p>
          <div className="flex gap-2">
            <Button>Approve</Button>
            <Button variant="danger">Block</Button>
            <Button variant="ghost">Escalate</Button>
          </div>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
