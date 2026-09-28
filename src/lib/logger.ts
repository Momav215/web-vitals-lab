import { LogLevel, StructuredLogPayload } from './types';

let currentCorrelationId = '';

export function getOrCreateCorrelationId(): string {
  if (!currentCorrelationId) {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      currentCorrelationId = crypto.randomUUID();
    } else {
      currentCorrelationId = `corr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
  }
  return currentCorrelationId;
}

export function resetCorrelationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    currentCorrelationId = crypto.randomUUID();
  } else {
    currentCorrelationId = `corr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  return currentCorrelationId;
}

export class StructuredLogger {
  private static buffer: StructuredLogPayload[] = [];
  private static listeners: Array<(log: StructuredLogPayload) => void> = [];

  static subscribe(listener: (log: StructuredLogPayload) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  static getRecentLogs(): StructuredLogPayload[] {
    return [...this.buffer];
  }

  static emit(
    level: LogLevel,
    event: string,
    details?: Record<string, unknown>,
    metrics?: StructuredLogPayload['metrics']
  ): StructuredLogPayload {
    const correlationId = getOrCreateCorrelationId();
    const isBrowser = typeof window !== 'undefined';

    const memory =
      isBrowser && (performance as any)?.memory
        ? {
            memoryHeapLimitMb: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576),
            memoryUsedMb: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
          }
        : {};

    const payload: StructuredLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      correlationId,
      source: isBrowser ? 'client' : 'server',
      event,
      metrics,
      context: isBrowser
        ? {
            pathname: window.location.pathname,
            userAgent: navigator.userAgent,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
            ...memory,
          }
        : undefined,
      details,
    };

    this.buffer.unshift(payload);
    if (this.buffer.length > 50) {
      this.buffer.pop();
    }

    this.listeners.forEach((listener) => listener(payload));

    if (isBrowser && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/telemetry', blob);
      } catch {
        // Fallback or ignore in local environments
      }
    }

    return payload;
  }
}
