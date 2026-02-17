'use client';

import { Dialog, DialogPanel } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { mainNav, instructorNav, adminNav, orgNav } from '@/shared/navigation/routes';
import { useAppStore } from '@/shared/store/app-store';

export function CommandPalette() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const role = useAppStore((state) => state.role);
  const open = useAppStore((state) => state.commandPaletteOpen);
  const toggle = useAppStore((state) => state.toggleCommandPalette);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggle(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  const commands = useMemo(() => {
    const all = [...mainNav, ...instructorNav, ...adminNav, ...orgNav].filter((item) => item.roles.includes(role));
    if (!query.trim()) {
      return all;
    }

    return all.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  }, [query, role]);

  return (
    <Dialog open={open} onClose={() => toggle(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-20">
        <DialogPanel className="w-full max-w-xl rounded-xl border border-line bg-panel p-3 shadow-2xl">
          <input
            aria-label="Global search"
            className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent/70"
            placeholder="Search pages or actions..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="mt-3 max-h-80 overflow-auto">
            {commands.map((item) => (
              <button
                key={item.href}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-bg hover:text-text"
                onClick={() => {
                  toggle(false);
                  router.push(item.href);
                }}
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase tracking-wide">{item.href}</span>
              </button>
            ))}
            {commands.length === 0 ? <p className="px-3 py-4 text-sm text-muted">No results.</p> : null}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
