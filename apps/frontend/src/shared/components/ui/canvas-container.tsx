'use client';

import { ReactNode } from 'react';

export function CanvasContainer({ children }: { children: ReactNode }) {
  return <div className="relative h-[70vh] overflow-hidden rounded-xl border border-line bg-bg">{children}</div>;
}
