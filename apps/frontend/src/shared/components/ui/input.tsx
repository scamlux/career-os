import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

type ValidationState = 'default' | 'error' | 'success';

type BaseInputProps = {
  label?: string;
  hint?: string;
  validationState?: ValidationState;
};

type InputProps = InputHTMLAttributes<HTMLInputElement> & BaseInputProps;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & BaseInputProps;

const stateMap: Record<ValidationState, string> = {
  default: 'border-line focus:border-accent/60',
  error: 'border-danger/60 focus:border-danger',
  success: 'border-success/60 focus:border-success'
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, validationState = 'default', className, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {label ? <span>{label}</span> : null}
      <input
        ref={ref}
        className={cn(
          'rounded-lg border bg-bg px-3 py-2 text-sm text-text outline-none transition',
          stateMap[validationState],
          className
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, validationState = 'default', className, ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {label ? <span>{label}</span> : null}
      <textarea
        ref={ref}
        className={cn(
          'rounded-lg border bg-bg px-3 py-2 text-sm text-text outline-none transition',
          stateMap[validationState],
          className
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
});
