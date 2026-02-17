import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">CareerOS Platform</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-text md:text-6xl">
        AI-native frontend for career growth, learning, roadmap execution and team intelligence.
      </h1>
      <p className="mt-5 max-w-2xl text-base text-muted md:text-lg">
        Built with Next.js App Router, feature-based modules, RBAC-aware navigation, real-time AI streaming and canvas-driven roadmap interaction.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="ghost">Create Account</Button>
        </Link>
      </div>
    </main>
  );
}
