'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

type AccordionItem = {
  title: string;
  content: ReactNode;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Disclosure key={item.title} as="div" className="rounded-lg border border-line bg-panel">
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-text">
                {item.title}
                <ChevronDown className={open ? 'rotate-180 transition' : 'transition'} size={16} />
              </DisclosureButton>
              <DisclosurePanel className="px-3 pb-3 text-sm text-muted">{item.content}</DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
