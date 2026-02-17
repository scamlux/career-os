import { Button } from '@/shared/components/ui/button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
      <p>{message}</p>
      {onRetry ? (
        <Button variant="danger" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
