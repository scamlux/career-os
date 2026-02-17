import { Lock } from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';

export function FeatureLock({ title, description, children, locked }: { title: string; description: string; children: ReactNode; locked: boolean }) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-line">
      <div className="pointer-events-none blur-[2px] opacity-35">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/80 p-5 text-center">
        <Lock className="text-warning" size={20} />
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <p className="max-w-md text-sm text-muted">{description}</p>
        <Button>Upgrade Plan</Button>
      </div>
    </div>
  );
}
