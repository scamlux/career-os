'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

type TabItem = {
  key: string;
  label: string;
  content: ReactNode;
};

export function Tabs({ items }: { items: TabItem[] }) {
  return (
    <TabGroup>
      <TabList className="mb-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Tab
            key={item.key}
            className={({ selected }) =>
              cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium outline-none ring-accent/70 transition focus-visible:ring-2',
                selected ? 'bg-accent/80 text-white' : 'bg-panel text-muted hover:text-text'
              )
            }
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {items.map((item) => (
          <TabPanel key={item.key}>{item.content}</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
