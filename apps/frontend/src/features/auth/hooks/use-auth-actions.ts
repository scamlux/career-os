'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginApi, registerApi } from '@/features/auth/api/auth-api';
import { useAppStore } from '@/shared/store/app-store';

export function useAuthActions() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);

  const login = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuth({
        userId: data.userId,
        tenantId: data.tenantId,
        email: '',
        token: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        role: data.role ?? 'free_user',
        plan: data.plan ?? 'free'
      });
      router.push('/app/dashboard');
    }
  });

  const register = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setAuth({
        userId: data.userId,
        tenantId: data.tenantId,
        email: '',
        token: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        role: data.role ?? 'free_user',
        plan: data.plan ?? 'free'
      });
      router.push('/app/dashboard');
    }
  });

  return { login, register };
}
