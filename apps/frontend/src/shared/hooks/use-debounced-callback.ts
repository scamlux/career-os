'use client';

import { useMemo, useRef } from 'react';

export function useDebouncedCallback<T extends (...args: never[]) => void>(callback: T, delayMs: number) {
  const timerRef = useRef<number | null>(null);

  return useMemo(() => {
    return ((...args: Parameters<T>) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => callback(...args), delayMs);
    }) as T;
  }, [callback, delayMs]);
}
