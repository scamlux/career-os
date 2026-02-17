import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-sm text-muted">The route does not exist or is restricted for your role.</p>
      <Link href="/app/dashboard" className="mt-6">
        <Button>Go to Dashboard</Button>
      </Link>
    </main>
  );
}
