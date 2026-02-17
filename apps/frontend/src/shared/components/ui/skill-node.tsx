'use client';

import { memo } from 'react';
import { cn } from '@/shared/utils/cn';

type SkillNodeProps = {
  id: string;
  label: string;
  progress: number;
  x: number;
  y: number;
  selected: boolean;
  onPointerDown: (id: string, x: number, y: number) => void;
  onClick: (id: string) => void;
};

export const SkillNode = memo(function SkillNode({ id, label, progress, x, y, selected, onPointerDown, onClick }: SkillNodeProps) {
  return (
    <button
      aria-label={`Skill node ${label}`}
      className={cn(
        'absolute w-36 rounded-lg border bg-panel px-3 py-2 text-left shadow transition',
        selected ? 'border-accent text-text' : 'border-line text-muted'
      )}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown(id, event.clientX, event.clientY);
      }}
      onClick={() => onClick(id)}
    >
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 h-1.5 rounded-full bg-bg">
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
      </div>
    </button>
  );
});
