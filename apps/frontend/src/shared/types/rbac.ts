export type AppRole =
  | 'guest'
  | 'free_user'
  | 'premium_user'
  | 'instructor'
  | 'admin'
  | 'org_admin';

export type SubscriptionPlan = 'free' | 'premium' | 'team' | 'enterprise';

export type RoleVisibility = AppRole[];
