import { ReactNode } from 'react';

export function ChartWrapper({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-4">
      <h3 className="mb-3 text-sm font-semibold text-text">{title}</h3>
      <div className="h-56">{children}</div>
    </section>
  );
}
