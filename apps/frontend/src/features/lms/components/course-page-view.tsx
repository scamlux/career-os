'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/http-client';
import { Button } from '@/shared/components/ui/button';
import { FeatureGate } from '@/shared/components/navigation/feature-gate';
import { useEnrollCourse } from '@/features/lms/hooks/use-enroll-course';
import { useAppStore } from '@/shared/store/app-store';

export function CoursePageView({ courseId }: { courseId: string }) {
  const plan = useAppStore((state) => state.plan);
  const courseQuery = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiRequest<{ course_id: string; title: string; instructor_id: string; is_published: boolean }>('gateway', `/v1/lms/courses/${courseId}`)
  });

  const enroll = useEnrollCourse(courseId);

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
      <aside className="panel">
        <h3 className="text-sm font-semibold text-text">Curriculum</h3>
        <ul className="mt-2 space-y-2 text-sm text-muted">
          <li>1. Foundations</li>
          <li>2. Architecture Patterns</li>
          <li>3. Project Implementation</li>
          <li>4. Interview readiness</li>
        </ul>
      </aside>

      <section className="space-y-4">
        <div className="panel">
          <p className="text-sm text-muted">Instructor ID: {courseQuery.data?.instructor_id ?? 'n/a'}</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">{courseQuery.data?.title ?? 'Course'}</h2>
          <p className="mt-2 text-sm text-muted">Skill relevance: backend architecture, reliability, interview system design.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <FeatureGate feature="ai_chat" title="Enrollment locked" description="This action requires active plan.">
              <Button onClick={() => enroll.mutate()} disabled={enroll.isPending}>
                {enroll.isPending ? 'Enrolling...' : 'Enroll'}
              </Button>
            </FeatureGate>
            <Link href={`/app/courses/${courseId}/lesson/lesson-1`}>
              <Button variant="ghost">Open lesson</Button>
            </Link>
          </div>
          {plan === 'free' ? (
            <p className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
              Payment required for premium curriculum and certificate paths.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
