import { serviceBaseMap } from '@/shared/config/service-config';
import { ServiceKey } from '@/shared/types/app';

const DEFAULT_TIMEOUT_MS = 15000;

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeoutMs?: number;
};

export async function apiRequest<T>(service: ServiceKey, path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const base = serviceBaseMap[service].replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    const response = await fetch(`${base}${normalizedPath}`, {
      ...options,
      headers: {
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {})
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: 'no-store'
    });

    const text = await response.text();
    const data = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      const message =
        typeof data === 'string'
          ? data
          : JSON.stringify(data ?? { status: response.status, message: response.statusText });
      throw new Error(message);
    }

    return data as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
