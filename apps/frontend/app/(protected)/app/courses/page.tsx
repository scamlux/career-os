import { PageShell } from '@/shared/components/ui/page-shell';
import { LMSCatalogView } from '@/features/lms/components/lms-catalog-view';

export default function CoursesPage() {
  return (
    <PageShell title="LMS Catalog" subtitle="Search, filter and enroll in role-relevant learning modules.">
      <LMSCatalogView />
    </PageShell>
  );
}
