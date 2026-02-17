import { ReactNode } from 'react';
import { AppHeader } from '@/shared/components/layout/app-header';
import { LeftSidebar } from '@/shared/components/layout/left-sidebar';
import { RightPanel } from '@/shared/components/layout/right-panel';
import { CommandPalette } from '@/shared/components/navigation/command-palette';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg text-text">
      <LeftSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto px-6 py-5">{children}</main>
      </div>
      <RightPanel />
      <CommandPalette />
    </div>
  );
}
