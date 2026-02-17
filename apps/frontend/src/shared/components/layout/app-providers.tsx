'use client';

import { ReactNode } from 'react';
import { QueryProvider } from '@/shared/query/query-provider';
import { OfflineBanner } from '@/shared/components/layout/offline-banner';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <OfflineBanner />
      {children}
    </QueryProvider>
  );
}
