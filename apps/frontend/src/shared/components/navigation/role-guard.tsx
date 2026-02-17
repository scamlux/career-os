'use client';

import { ReactNode } from 'react';
import { canAccess } from '@/shared/auth/rbac';
import { useAppStore } from '@/shared/store/app-store';
import { AppRole } from '@/shared/types/rbac';

export function RoleGuard({ roles, children, fallback }: { roles: AppRole[]; children: ReactNode; fallback?: ReactNode }) {
  const role = useAppStore((state) => state.role);

  if (!canAccess(role, roles)) {
    return <>{fallback ?? <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">403 role restriction</div>}</>;
  }

  return <>{children}</>;
}
