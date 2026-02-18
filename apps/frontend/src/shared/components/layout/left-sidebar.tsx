'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { mainNav, instructorNav, adminNav, orgNav } from '@/shared/navigation/routes';
import { useAppStore } from '@/shared/store/app-store';
import { cn } from '@/shared/utils/cn';

export function LeftSidebar() {
  const pathname = usePathname();
  const role = useAppStore((state) => state.role);
  const plan = useAppStore((state) => state.plan);

  const sections = [
    { label: 'App', items: mainNav.filter((item) => item.roles.includes(role)) },
    { label: 'Instructor', items: instructorNav.filter((item) => item.roles.includes(role)) },
    { label: 'Admin', items: adminNav.filter((item) => item.roles.includes(role)) },
    { label: 'Organization', items: orgNav.filter((item) => item.roles.includes(role)) }
  ].filter((section) => section.items.length > 0);

  return (
    <aside className="sticky top-0 h-screen w-[260px] border-r border-line bg-panel/70 px-4 py-5 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">CareerOS</p>
        <h1 className="mt-2 text-xl font-semibold text-text">Control UI</h1>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-bg p-3 text-xs text-muted">
        <p>Role: <span className="font-semibold text-text">{role}</span></p>
        <p>Plan: <span className="font-semibold text-text">{plan}</span></p>
      </div>

      <nav className="mt-6 space-y-4" aria-label="Main">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm transition',
                      active ? 'bg-accent/90 text-white' : 'text-muted hover:bg-bg hover:text-text'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
