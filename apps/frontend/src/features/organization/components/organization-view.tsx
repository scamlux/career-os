'use client';

import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { RoleGuard } from '@/shared/components/navigation/role-guard';
import { PageShell } from '@/shared/components/ui/page-shell';

const heatmap = [
  { team: 'Engineering', score: 76 },
  { team: 'Product', score: 63 },
  { team: 'Design', score: 69 },
  { team: 'Operations', score: 57 }
];

export function OrganizationView() {
  return (
    <RoleGuard roles={['org_admin', 'admin']}>
      <PageShell title="Organization Dashboard" subtitle="Team skill heatmap, role management and subscription visibility.">
        <div className="grid gap-4 xl:grid-cols-3">
          <section className="panel xl:col-span-2 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmap}>
                <XAxis dataKey="team" stroke="hsl(var(--muted))" />
                <YAxis stroke="hsl(var(--muted))" />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </section>
          <section className="panel text-sm text-muted">
            <h3 className="text-sm font-semibold text-text">Role management</h3>
            <p className="mt-2">Assign roadmap templates and roles per employee group.</p>
            <p className="mt-2">Subscription: Team plan active.</p>
          </section>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
