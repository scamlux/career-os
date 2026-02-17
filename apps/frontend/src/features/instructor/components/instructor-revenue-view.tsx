'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { RoleGuard } from '@/shared/components/navigation/role-guard';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { PageShell } from '@/shared/components/ui/page-shell';

const data = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 1580 },
  { month: 'Mar', revenue: 1930 },
  { month: 'Apr', revenue: 2010 }
];

export function InstructorRevenueView() {
  const missing = false;

  return (
    <RoleGuard roles={['instructor', 'admin']}>
      <PageShell title="Revenue" subtitle="Revenue stats and payout trends for instructor content.">
        {missing ? (
          <EmptyState title="Revenue data missing" description="Payments service has not returned data yet." />
        ) : (
          <div className="panel h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="month" stroke="hsl(var(--muted))" />
                <YAxis stroke="hsl(var(--muted))" />
                <Tooltip />
                <Line dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </PageShell>
    </RoleGuard>
  );
}
