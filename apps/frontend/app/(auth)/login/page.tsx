'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/features/auth/api/auth-api';
import { AuthCard } from '@/features/auth/components/auth-card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { AppRole, SubscriptionPlan } from '@/shared/types/rbac';
import { useAppStore } from '@/shared/store/app-store';

const roles: AppRole[] = ['free_user', 'premium_user', 'instructor', 'admin', 'org_admin'];
const plans: SubscriptionPlan[] = ['free', 'premium', 'team', 'enterprise'];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const [email, setEmail] = useState('demo@careeros.dev');
  const [password, setPassword] = useState('CareerOS#123');
  const [role, setRole] = useState<AppRole>('free_user');
  const [plan, setPlan] = useState<SubscriptionPlan>('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginApi({ email, password });
      setAuth({
        userId: response.userId,
        tenantId: response.tenantId,
        email,
        token: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        role: response.role ?? role,
        plan: response.plan ?? plan
      });
      router.push('/app/dashboard');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <AuthCard title="Welcome Back" subtitle="Login and continue your career execution flow.">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-muted">
              Simulated role
              <select
                className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text"
                value={role}
                onChange={(event) => setRole(event.target.value as AppRole)}
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted">
              Simulated plan
              <select
                className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text"
                value={plan}
                onChange={(event) => setPlan(event.target.value as SubscriptionPlan)}
              >
                {plans.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-2 text-sm text-danger">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <Link href="/forgot-password" className="hover:text-text">
            Forgot password?
          </Link>
          <Link href="/register" className="hover:text-text">
            Create account
          </Link>
        </div>
      </AuthCard>
    </main>
  );
}
