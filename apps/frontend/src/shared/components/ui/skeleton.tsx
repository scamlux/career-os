import { cn } from '@/shared/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-[linear-gradient(110deg,hsl(var(--line))_25%,hsl(var(--panel))_37%,hsl(var(--line))_63%)] bg-[length:200%_100%] animate-shimmer', className)} />;
}
