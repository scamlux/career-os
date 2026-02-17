'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { PageShell } from '@/shared/components/ui/page-shell';
import { AppRole, SubscriptionPlan } from '@/shared/types/rbac';
import { FeatureKey } from '@/shared/features/feature-gates';
import { useAppStore } from '@/shared/store/app-store';

const roles: AppRole[] = ['free_user', 'premium_user', 'instructor', 'org_admin', 'admin'];
const plans: SubscriptionPlan[] = ['free', 'premium', 'team', 'enterprise'];
const featureList: FeatureKey[] = [
  'ai_chat',
  'ai_resume_analysis',
  'ai_interview_simulation',
  'roadmap_regeneration',
  'advanced_analytics',
  'team_dashboard',
  'course_builder',
  'admin_tools'
];

export function SettingsView() {
  const { role, plan, setRole, setPlan, featureFlags, setFeatureFlag, logout } = useAppStore((state) => ({
    role: state.role,
    plan: state.plan,
    setRole: state.setRole,
    setPlan: state.setPlan,
    featureFlags: state.featureFlags,
    setFeatureFlag: state.setFeatureFlag,
    logout: state.logout
  }));

  const [language, setLanguage] = useState('en');

  return (
    <PageShell title="Settings" subtitle="RBAC, feature gates, localization and workspace controls.">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel space-y-3">
          <h3 className="text-sm font-semibold text-text">Access Control</h3>
          <label className="text-sm text-muted">
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as AppRole)} className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text">
              {roles.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-muted">
            Plan
            <select value={plan} onChange={(event) => setPlan(event.target.value as SubscriptionPlan)} className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text">
              {plans.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <Button variant="danger" onClick={logout}>Logout</Button>
        </section>

        <section className="panel space-y-3">
          <h3 className="text-sm font-semibold text-text">Feature Flags</h3>
          {featureList.map((feature) => (
            <label key={feature} className="flex items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-sm text-muted">
              {feature}
              <input
                type="checkbox"
                checked={featureFlags[feature] ?? true}
                onChange={(event) => setFeatureFlag(feature, event.target.checked)}
                aria-label={`Toggle ${feature}`}
              />
            </label>
          ))}
        </section>

        <section className="panel space-y-3 xl:col-span-2">
          <h3 className="text-sm font-semibold text-text">Future Extensibility</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-muted">
              Language
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text">
                <option value="en">English</option>
                <option value="ru">Russian</option>
                <option value="es">Spanish</option>
              </select>
            </label>
            <div className="rounded-lg border border-line bg-bg p-3 text-sm text-muted">White-label ready: color tokens + logo slot + organization theme map.</div>
            <div className="rounded-lg border border-line bg-bg p-3 text-sm text-muted">Micro-frontend split ready: feature folders isolated by domain boundaries.</div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
