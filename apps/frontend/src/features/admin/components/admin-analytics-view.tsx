'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { RoleGuard } from '@/shared/components/navigation/role-guard';
import { PageShell } from '@/shared/components/ui/page-shell';

const data = [
  { name: 'Signups', value: 212 },
  { name: 'Premium', value: 84 },
  { name: 'Retention', value: 74 }
];

export function AdminAnalyticsView() {
  return (
    <RoleGuard roles={['admin']}>
      <PageShell title="Platform Analytics" subtitle="Platform-wide growth and retention metrics.">
        <div className="panel h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="hsl(var(--muted))" />
              <YAxis stroke="hsl(var(--muted))" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
