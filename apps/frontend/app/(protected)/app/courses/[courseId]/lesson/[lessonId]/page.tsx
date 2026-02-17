import { PageShell } from '@/shared/components/ui/page-shell';
import { LessonPageView } from '@/features/lms/components/lesson-page-view';

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;

  return (
    <PageShell title="Lesson" subtitle="Split layout video + notes + timed quiz with immediate feedback.">
      <LessonPageView courseId={courseId} lessonId={lessonId} />
    </PageShell>
  );
}
