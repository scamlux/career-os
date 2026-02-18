'use client';

import { motion } from 'framer-motion';
import { useAppStore, ServiceMode } from '@/shared/store/app-store';
import { cn } from '@/shared/utils/cn';

const modeItems: Array<{ value: ServiceMode; label: string }> = [
  { value: 'ai_hr', label: 'AI-HR' },
  { value: 'roadmap', label: 'Roadmap' },
  { value: 'courses', label: 'Courses' }
];

export function FloatingModeSwitcher() {
  const mode = useAppStore((state) => state.mode);
  const setMode = useAppStore((state) => state.setMode);

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div className="relative flex items-center gap-1 rounded-full border border-line/70 bg-panel/70 p-1 backdrop-blur-xl shadow-lg">
        {modeItems.map((item) => {
          const active = mode === item.value;
          return (
            <button
              key={item.value}
              className={cn(
                'relative z-10 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
                active ? 'text-white' : 'text-muted hover:text-text'
              )}
              onClick={() => setMode(item.value)}
            >
              {active ? (
                <motion.span
                  layoutId="active-mode-tab"
                  className="absolute inset-0 rounded-full bg-accent/80"
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
              ) : null}
              <span className="relative z-20">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
