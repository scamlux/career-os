'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { queryClient } from '@/shared/query/query-client';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => queryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
