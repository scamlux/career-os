'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-warning/20 py-2 text-sm text-warning">
      <WifiOff size={16} />
      Network offline mode enabled. Actions are queued locally.
    </div>
  );
}
