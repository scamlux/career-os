import { PageShell } from '@/shared/components/ui/page-shell';
import { CoursePageView } from '@/features/lms/components/course-page-view';

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  return (
    <PageShell title="Course" subtitle="Curriculum sidebar, instructor profile and enrollment workflow.">
      <CoursePageView courseId={courseId} />
    </PageShell>
  );
}
