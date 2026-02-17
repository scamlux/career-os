'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAppStore } from '@/shared/store/app-store';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAppStore((state) => state.token);
  const role = useAppStore((state) => state.role);

  useEffect(() => {
    if (!token || role === 'guest') {
      router.replace('/login');
    }
  }, [router, token, role]);

  if (!token || role === 'guest') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-muted">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
