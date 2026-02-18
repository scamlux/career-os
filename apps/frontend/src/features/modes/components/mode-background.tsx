'use client';

import { useAppStore } from '@/shared/store/app-store';
import { cn } from '@/shared/utils/cn';

export function ModeBackgroundLayer() {
  const mode = useAppStore((state) => state.mode);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 transition duration-500',
        mode === 'ai_hr' && 'bg-[radial-gradient(circle_at_18%_15%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(14,116,144,0.16),transparent_34%)]',
        mode === 'roadmap' && 'bg-[radial-gradient(circle_at_18%_15%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(234,179,8,0.14),transparent_34%)]',
        mode === 'courses' && 'bg-[radial-gradient(circle_at_18%_15%,rgba(168,85,247,0.14),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(249,115,22,0.12),transparent_34%)]'
      )}
    />
  );
}
