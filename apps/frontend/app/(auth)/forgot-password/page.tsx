'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/features/auth/api/auth-api';
import { AuthCard } from '@/features/auth/components/auth-card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await requestPasswordReset({ email });
    setMessage(response.message);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <AuthCard title="Forgot Password" subtitle="We will send a reset link to your email.">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Button className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
        {message ? <p className="mt-4 rounded-md border border-success/30 bg-success/10 p-2 text-sm text-success">{message}</p> : null}
        <Link href="/login" className="mt-4 block text-sm text-muted hover:text-text">
          Back to login
        </Link>
      </AuthCard>
    </main>
  );
}
