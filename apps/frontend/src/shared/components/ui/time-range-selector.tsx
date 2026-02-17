'use client';

import { TimeRange } from '@/shared/types/app';
import { Button } from '@/shared/components/ui/button';

const ranges: TimeRange[] = ['7d', '30d', '90d'];

export function TimeRangeSelector({ value, onChange }: { value: TimeRange; onChange: (range: TimeRange) => void }) {
  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <Button key={range} variant={range === value ? 'primary' : 'ghost'} className="px-3 py-1 text-xs" onClick={() => onChange(range)}>
          {range}
        </Button>
      ))}
    </div>
  );
}
