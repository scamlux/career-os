'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/shared/store/app-store';
import { AIHRMode } from '@/features/modes/components/ai-hr-mode';
import { CoursesMode } from '@/features/modes/components/courses-mode';
import { RoadmapMode } from '@/features/modes/components/roadmap-mode';

export function ServiceModeWorkspace() {
  const mode = useAppStore((state) => state.mode);

  return (
    <div className="mt-14">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {mode === 'ai_hr' ? <AIHRMode /> : null}
          {mode === 'roadmap' ? <RoadmapMode /> : null}
          {mode === 'courses' ? <CoursesMode /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
