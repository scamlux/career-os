import { apiRequest } from '@/shared/api/http-client';
import { LoginResponse } from '@/features/auth/types/auth.types';

export async function loginApi(input: { email: string; password: string }) {
  return apiRequest<LoginResponse>('auth', '/auth/login', {
    method: 'POST',
    body: input
  });
}

export async function registerApi(input: { email: string; password: string; tenantId?: string }) {
  return apiRequest<LoginResponse>('auth', '/auth/register', {
    method: 'POST',
    body: input
  });
}

export async function requestPasswordReset(input: { email: string }) {
  return new Promise<{ ok: boolean; message: string }>((resolve) => {
    setTimeout(() => resolve({ ok: true, message: `Reset link sent to ${input.email}` }), 600);
  });
}
