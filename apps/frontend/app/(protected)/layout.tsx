import type { ReactNode } from 'react';
import { AuthGuard } from '@/shared/components/layout/auth-guard';
import { AppShell } from '@/shared/components/layout/app-shell';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
