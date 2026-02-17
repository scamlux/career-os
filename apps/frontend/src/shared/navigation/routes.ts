import { AppRole } from '@/shared/types/rbac';

export type NavItem = {
  href: string;
  label: string;
  roles: AppRole[];
};

export const mainNav: NavItem[] = [
  { href: '/app/dashboard', label: 'Dashboard', roles: ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'] },
  { href: '/app/ai-assistant', label: 'AI Assistant', roles: ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'] },
  { href: '/app/roadmap/canvas', label: 'Roadmap', roles: ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'] },
  { href: '/app/courses', label: 'Courses', roles: ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'] },
  { href: '/app/analytics', label: 'Analytics', roles: ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'] },
  { href: '/app/profile', label: 'Profile', roles: ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'] },
  { href: '/app/settings', label: 'Settings', roles: ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'] }
];

export const instructorNav: NavItem[] = [
  { href: '/instructor/courses', label: 'Instructor Courses', roles: ['instructor', 'admin'] },
  { href: '/instructor/students', label: 'Students', roles: ['instructor', 'admin'] },
  { href: '/instructor/revenue', label: 'Revenue', roles: ['instructor', 'admin'] }
];

export const adminNav: NavItem[] = [
  { href: '/admin/users', label: 'Users', roles: ['admin'] },
  { href: '/admin/moderation', label: 'Moderation', roles: ['admin'] },
  { href: '/admin/plans', label: 'Plans', roles: ['admin'] },
  { href: '/admin/analytics', label: 'Platform Analytics', roles: ['admin'] }
];

export const orgNav: NavItem[] = [{ href: '/organization', label: 'Organization', roles: ['org_admin', 'admin'] }];
