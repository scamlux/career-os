'use client';

import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { FeatureGate } from '@/shared/components/navigation/feature-gate';
import { ChartWrapper } from '@/shared/components/ui/chart-wrapper';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { PageShell } from '@/shared/components/ui/page-shell';
import { TimeRangeSelector } from '@/shared/components/ui/time-range-selector';
import { TimeRange } from '@/shared/types/app';

const weekly = [
  { label: 'W1', value: 42 },
  { label: 'W2', value: 56 },
  { label: 'W3', value: 61 },
  { label: 'W4', value: 67 }
];

const heatmap = [
  { skill: 'System Design', score: 72 },
  { skill: 'Backend', score: 84 },
  { skill: 'Leadership', score: 46 },
  { skill: 'Communication', score: 58 }
];

export function AnalyticsView() {
  const [range, setRange] = useState<TimeRange>('30d');

  const noData = false;

  if (noData) {
    return <EmptyState title="No data yet" description="Complete learning activities to generate analytics." />;
  }

  return (
    <PageShell
      title="Analytics"
      subtitle="Mastery score, weekly productivity and skill heatmap with hover insights."
      actions={<TimeRangeSelector value={range} onChange={setRange} />}
    >
      <FeatureGate
        feature="advanced_analytics"
        title="Advanced analytics locked"
        description="Upgrade to premium to access full historical analytics and predictive insights."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <ChartWrapper title="Weekly productivity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <XAxis dataKey="label" stroke="hsl(var(--muted))" />
                <YAxis stroke="hsl(var(--muted))" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <ChartWrapper title="Skill heatmap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmap} layout="vertical">
                <XAxis type="number" stroke="hsl(var(--muted))" />
                <YAxis dataKey="skill" type="category" stroke="hsl(var(--muted))" width={100} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--accent))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <div className="panel">
            <h3 className="text-sm font-semibold text-text">Projected completion</h3>
            <p className="mt-3 text-4xl font-semibold text-text">78%</p>
            <p className="mt-2 text-sm text-muted">Based on current trend in {range}. Partial data fallback is enabled for delayed APIs.</p>
          </div>
        </div>
      </FeatureGate>
    </PageShell>
  );
}
