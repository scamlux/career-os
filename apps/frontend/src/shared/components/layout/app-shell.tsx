'use client';

import { ReactNode } from 'react';
import { AppHeader } from '@/shared/components/layout/app-header';
import { CommandPalette } from '@/shared/components/navigation/command-palette';
import { FloatingModeSwitcher } from '@/features/modes/components/floating-mode-switcher';
import { AlwaysOnAIButton } from '@/features/modes/components/always-on-ai-button';
import { ModeBackgroundLayer } from '@/features/modes/components/mode-background';
import { useAppStore } from '@/shared/store/app-store';

export function AppShell({ children }: { children: ReactNode }) {
  const mode = useAppStore((state) => state.mode);

  return (
    <div className="relative min-h-screen bg-bg text-text" data-mode={mode}>
      <ModeBackgroundLayer />
      <FloatingModeSwitcher />
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto px-4 py-5 md:px-6">{children}</main>
      </div>
      <AlwaysOnAIButton />
      <CommandPalette />
    </div>
  );
}
