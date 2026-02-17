'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Input, Textarea } from '@/shared/components/ui/input';
import { PageShell } from '@/shared/components/ui/page-shell';
import { apiRequest } from '@/shared/api/http-client';
import { useAppStore } from '@/shared/store/app-store';
import { useState } from 'react';

export function ProfileView() {
  const { userId, tenantId, email } = useAppStore((state) => ({ userId: state.userId, tenantId: state.tenantId, email: state.email }));

  const profile = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => apiRequest<{ full_name: string; title: string; location: string; bio: string }>('gateway', `/v1/profiles/${userId}`),
    enabled: Boolean(userId)
  });

  const [form, setForm] = useState({ fullName: '', title: '', location: '', bio: '' });

  const save = useMutation({
    mutationFn: () =>
      apiRequest('profile', `/profiles/${userId}`, {
        method: 'PUT',
        headers: { 'x-tenant-id': tenantId },
        body: form
      })
  });

  return (
    <PageShell title="Profile" subtitle="Manage personal context used by AI and roadmap generation.">
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="panel space-y-3">
          <p className="text-sm text-muted">Email: {email || 'n/a'}</p>
          <Input label="Full name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
          <Input label="Title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          <Input label="Location" value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} />
          <Textarea label="Bio" rows={4} value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save profile'}</Button>
        </div>

        <div className="panel space-y-2">
          <h3 className="text-sm font-semibold text-text">Current profile snapshot</h3>
          <pre className="overflow-auto rounded-lg bg-bg p-3 text-xs text-muted">{JSON.stringify(profile.data, null, 2)}</pre>
        </div>
      </div>
    </PageShell>
  );
}
