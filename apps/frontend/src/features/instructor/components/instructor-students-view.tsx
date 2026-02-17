import { RoleGuard } from '@/shared/components/navigation/role-guard';
import { PageShell } from '@/shared/components/ui/page-shell';

const rows = [
  { name: 'Sam Lee', engagement: 'High', completion: '82%' },
  { name: 'Nina Patel', engagement: 'Medium', completion: '59%' },
  { name: 'Omar Khan', engagement: 'Low', completion: '22%' }
];

export function InstructorStudentsView() {
  return (
    <RoleGuard roles={['instructor', 'admin']}>
      <PageShell title="Students" subtitle="Track engagement and completion in near real-time.">
        <div className="panel overflow-auto">
          <table className="w-full text-left text-sm text-muted">
            <thead>
              <tr className="border-b border-line text-text">
                <th className="py-2">Student</th>
                <th className="py-2">Engagement</th>
                <th className="py-2">Completion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-b border-line/70">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.engagement}</td>
                  <td className="py-2">{row.completion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
