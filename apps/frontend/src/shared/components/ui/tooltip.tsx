'use client';

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ReactNode } from 'react';

type TooltipProps = {
  label: ReactNode;
  children: ReactNode;
};

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <Popover className="relative inline-flex">
      <PopoverButton className="outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-md">{children}</PopoverButton>
      <PopoverPanel anchor="top" className="z-30 mb-2 max-w-xs rounded-md border border-line bg-panel p-2 text-xs text-text shadow-lg">
        {label}
      </PopoverPanel>
    </Popover>
  );
}
