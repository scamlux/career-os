import { RoleGuard } from '@/shared/components/navigation/role-guard';
import { PageShell } from '@/shared/components/ui/page-shell';

const users = [
  { id: 'u-1', email: 'alex@corp.dev', role: 'premium_user' },
  { id: 'u-2', email: 'mentor@corp.dev', role: 'instructor' },
  { id: 'u-3', email: 'ops@corp.dev', role: 'org_admin' }
];

export function AdminUsersView() {
  return (
    <RoleGuard roles={['admin']}>
      <PageShell title="Admin Users" subtitle="Global user administration and role moderation.">
        <div className="panel overflow-auto">
          <table className="w-full text-sm text-muted">
            <thead>
              <tr className="border-b border-line text-text">
                <th className="py-2">ID</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-b border-line/70">
                  <td className="py-2">{item.id}</td>
                  <td className="py-2">{item.email}</td>
                  <td className="py-2">{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageShell>
    </RoleGuard>
  );
}
