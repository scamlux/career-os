import { ReactNode } from 'react';

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-xl">
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}
