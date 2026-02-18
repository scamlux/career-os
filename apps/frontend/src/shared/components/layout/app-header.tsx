'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAppStore } from '@/shared/store/app-store';

export function AppHeader() {
  const togglePalette = useAppStore((state) => state.toggleCommandPalette);
  const mode = useAppStore((state) => state.mode);

  const modeLabel = mode === 'ai_hr' ? 'AI-HR Mode' : mode === 'roadmap' ? 'Roadmap Mode' : 'Courses Mode';

  return (
    <header className="flex items-center justify-between border-b border-line/80 px-4 py-3 md:px-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Career Operating System</p>
        <h1 className="text-lg font-semibold text-text">{modeLabel}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => togglePalette(true)}>
          <Search size={16} />
          Command Palette
        </Button>
        <Button variant="ghost" aria-label="Notifications">
          <Bell size={16} />
        </Button>
      </div>
    </header>
  );
}
