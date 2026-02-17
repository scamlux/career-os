'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Input } from '@/shared/components/ui/input';

const catalog = [
  { id: 'course-1', title: 'Distributed Systems Fundamentals', category: 'Backend', level: 'Intermediate' },
  { id: 'course-2', title: 'System Design for Scale', category: 'Architecture', level: 'Advanced' },
  { id: 'course-3', title: 'Career Interview Simulation', category: 'Career', level: 'Intermediate' }
];

export function LMSCatalogView() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return catalog.filter((course) => {
      if (category !== 'All' && course.category !== category) {
        return false;
      }
      if (!search.trim()) {
        return true;
      }
      return course.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [category, search]);

  if (filtered.length === 0) {
    return <EmptyState title="No courses found" description="Try adjusting search/filter criteria." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Input label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
        <label className="text-sm text-muted">
          Category
          <select className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>
            <option>Backend</option>
            <option>Architecture</option>
            <option>Career</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => (
          <Link key={course.id} href={`/app/courses/${course.id}`} className="rounded-xl border border-line bg-panel p-4 transition hover:border-accent/50">
            <p className="text-sm text-muted">{course.category} · {course.level}</p>
            <h3 className="mt-1 text-base font-semibold text-text">{course.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
