import { AppRole, SubscriptionPlan } from '@/shared/types/rbac';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponse = {
  userId: string;
  tenantId: string;
  tokens: AuthTokens;
  role?: AppRole;
  plan?: SubscriptionPlan;
};
