'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { PageShell } from '@/shared/components/ui/page-shell';
import { ProgressRing } from '@/shared/components/ui/progress-ring';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ErrorState } from '@/shared/components/ui/error-state';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';

const activityData = [
  { day: 'Mon', score: 24 },
  { day: 'Tue', score: 34 },
  { day: 'Wed', score: 38 },
  { day: 'Thu', score: 51 },
  { day: 'Fri', score: 64 },
  { day: 'Sat', score: 58 },
  { day: 'Sun', score: 71 }
];

export function DashboardView() {
  const { roadmap, progress, analytics } = useDashboardData();

  return (
    <PageShell title="Dashboard" subtitle="Track execution, learning velocity and AI-recommended actions.">
      <div className="grid gap-4 xl:grid-cols-4">
        <section className="panel xl:col-span-1">
          {progress.isLoading ? <Skeleton className="h-24" /> : <ProgressRing value={progress.data?.mastery_score ?? 0} label="Mastery" />}
        </section>

        <section className="panel xl:col-span-1">
          <p className="text-sm text-muted">Current goal status</p>
          <p className="mt-2 text-xl font-semibold text-text">{roadmap.data?.status ?? 'NO ROADMAP'}</p>
          <p className="mt-2 text-xs text-muted">Roadmap ID: {roadmap.data?.roadmap_id || 'n/a'}</p>
        </section>

        <section className="panel xl:col-span-1">
          <p className="text-sm text-muted">Learning streak</p>
          <p className="mt-2 text-2xl font-semibold text-text">{progress.data?.streak_days ?? 0} days</p>
          <p className="text-xs text-muted">Upcoming task: Complete lesson and regenerate stage suggestions.</p>
        </section>

        <section className="panel xl:col-span-1">
          <p className="text-sm text-muted">AI suggestion</p>
          <p className="mt-2 text-sm text-text">Focus on interview simulation twice this week to increase projected completion by 8%.</p>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="panel xl:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-text">Weekly productivity trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="day" stroke="hsl(var(--muted))" />
                <YAxis stroke="hsl(var(--muted))" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <h3 className="text-sm font-semibold text-text">Business snapshot</h3>
          {analytics.isError ? (
            <ErrorState message="Analytics API delay. Please retry later." onRetry={() => analytics.refetch()} />
          ) : (
            <div className="mt-3 space-y-2 text-sm text-muted">
              <p>DAU: <span className="font-semibold text-text">{analytics.data?.dau ?? 0}</span></p>
              <p>WAU: <span className="font-semibold text-text">{analytics.data?.wau ?? 0}</span></p>
              <p>MRR: <span className="font-semibold text-text">${analytics.data?.mrr_usd ?? 0}</span></p>
              <p>Churn Risk: <span className="font-semibold text-text">{analytics.data?.churn_risk_score ?? 0}</span></p>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
