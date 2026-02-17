'use client';

import { useState } from 'react';
import { RoleGuard } from '@/shared/components/navigation/role-guard';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { PageShell } from '@/shared/components/ui/page-shell';

export function AdminPlansView() {
  const [code, setCode] = useState('premium_monthly');

  return (
    <RoleGuard roles={['admin']}>
      <PageShell title="Plans" subtitle="Manage pricing plans and feature bundles.">
        <div className="panel space-y-3">
          <Input label="Plan code" value={code} onChange={(event) => setCode(event.target.value)} />
          <Input label="Price USD" defaultValue="29" />
          <Input label="Features (CSV)" defaultValue="ai.flow.execute,analytics.read,roadmap.regenerate" />
          <Button>Save Plan</Button>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
