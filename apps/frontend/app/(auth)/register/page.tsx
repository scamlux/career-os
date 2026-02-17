'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { registerApi } from '@/features/auth/api/auth-api';
import { AuthCard } from '@/features/auth/components/auth-card';
import { OnboardingWizard } from '@/features/auth/components/onboarding-wizard';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { apiRequest } from '@/shared/api/http-client';
import { useAppStore } from '@/shared/store/app-store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('CareerOS#123');
  const [step, setStep] = useState<'account' | 'onboarding' | 'ai' | 'done'>('account');
  const [error, setError] = useState<string | null>(null);
  const [aiFailed, setAiFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccount = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await registerApi({ email, password });
      setAuth({
        userId: data.userId,
        tenantId: data.tenantId,
        email,
        token: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
        role: 'free_user',
        plan: 'free'
      });
      setStep('onboarding');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingDone = async (payload: Record<string, string>) => {
    setStep('ai');
    setAiFailed(false);

    try {
      await apiRequest('gateway', '/v1/ai/flows/execute', {
        method: 'POST',
        body: {
          userId: useAppStore.getState().userId,
          tenantId: useAppStore.getState().tenantId,
          flowName: 'roadmap_generator',
          flowVersion: 'v1',
          input: payload
        }
      });

      setTimeout(() => setStep('done'), 1300);
    } catch {
      setAiFailed(true);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <AuthCard title="Create Account" subtitle="Register, complete onboarding and generate your AI roadmap.">
        {step === 'account' ? (
          <form className="space-y-4" onSubmit={handleAccount}>
            <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-2 text-sm text-danger">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Continue'}
            </Button>
          </form>
        ) : null}

        {step === 'onboarding' ? <OnboardingWizard onDone={handleOnboardingDone} /> : null}

        {step === 'ai' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-line bg-bg p-6 text-center">
            {!aiFailed ? (
              <>
                <p className="text-sm text-muted">AI is analyzing your profile and generating roadmap...</p>
                <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-panel">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-danger">AI generation failed. You can retry or continue with default roadmap.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button onClick={() => handleOnboardingDone({})}>Retry</Button>
                  <Button variant="ghost" onClick={() => setStep('done')}>
                    Continue
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ) : null}

        {step === 'done' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-success/30 bg-success/10 p-4 text-center">
            <p className="text-sm text-success">Onboarding complete. Redirecting to dashboard...</p>
            <Button className="mt-3" onClick={() => router.push('/app/dashboard')}>
              Enter Dashboard
            </Button>
          </motion.div>
        ) : null}
      </AuthCard>
    </main>
  );
}
