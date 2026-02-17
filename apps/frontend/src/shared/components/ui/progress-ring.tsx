import { cn } from '@/shared/utils/cn';

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
};

export function ProgressRing({ value, size = 92, stroke = 8, label }: ProgressRingProps) {
  const normalized = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (normalized / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center')} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="stroke-line fill-none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          className="stroke-accent fill-none transition-all"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-semibold text-text">{Math.round(normalized)}%</p>
        {label ? <p className="text-[10px] text-muted">{label}</p> : null}
      </div>
    </div>
  );
}
