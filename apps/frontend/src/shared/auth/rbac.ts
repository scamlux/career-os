import { AppRole } from '@/shared/types/rbac';

const roleOrder: Record<AppRole, number> = {
  guest: 0,
  free_user: 1,
  premium_user: 2,
  instructor: 3,
  org_admin: 4,
  admin: 5
};

export function canAccess(current: AppRole, allowedRoles: AppRole[]): boolean {
  return allowedRoles.includes(current);
}

export function hasRoleAtLeast(current: AppRole, minimum: AppRole): boolean {
  return roleOrder[current] >= roleOrder[minimum];
}
