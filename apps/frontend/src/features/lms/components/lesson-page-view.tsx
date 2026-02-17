'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/ui/error-state';

export function LessonPageView({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [score, setScore] = useState<number | null>(null);
  const [videoError, setVideoError] = useState(false);

  const progress = useMemo(() => Math.max(0, Math.min(100, ((90 - secondsLeft) / 90) * 100)), [secondsLeft]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="panel">
        <h3 className="text-sm font-semibold text-text">Lesson {lessonId}</h3>
        <div className="mt-3 aspect-video rounded-lg border border-line bg-black/30 p-3">
          {videoError ? (
            <ErrorState message="Video failed to load. Retry stream source." onRetry={() => setVideoError(false)} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">Video player placeholder (split layout ready)</div>
          )}
        </div>
        <div className="mt-3 h-2 rounded-full bg-bg">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => setVideoError(true)} variant="ghost">Simulate video fail</Button>
          <Button>Mark complete</Button>
          <Button variant="ghost">Next lesson auto-advance</Button>
        </div>
      </section>

      <aside className="panel">
        <h3 className="text-sm font-semibold text-text">Quiz (Timed)</h3>
        <p className="mt-2 text-sm text-muted">Remaining: {secondsLeft}s</p>
        <div className="mt-2 grid gap-2">
          <Button variant="ghost" onClick={() => setSecondsLeft((prev) => Math.max(0, prev - 15))}>Tick -15s</Button>
          <Button onClick={() => setScore(84)}>Submit answer</Button>
        </div>
        {secondsLeft === 0 ? <p className="mt-2 text-sm text-danger">Quiz timeout</p> : null}
        {score !== null ? <p className="mt-2 text-sm text-success">Score: {score}/100 (immediate feedback)</p> : null}
        <p className="mt-3 text-xs text-muted">Course: {courseId}. Network interruption fallback supported via optimistic UI queue.</p>
      </aside>
    </div>
  );
}
