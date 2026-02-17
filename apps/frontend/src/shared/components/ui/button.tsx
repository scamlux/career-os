import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

type ButtonVariant = 'primary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantMap: Record<ButtonVariant, string> = {
  primary: 'bg-accent/90 text-white hover:bg-accent',
  ghost: 'bg-transparent text-text hover:bg-panel',
  danger: 'bg-danger/80 text-white hover:bg-danger'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
        variantMap[variant],
        className
      )}
      {...props}
    />
  );
});
