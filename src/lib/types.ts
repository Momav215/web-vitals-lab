export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: MetricRating;
  delta: number;
  id: string;
  unit: 'ms' | 'score';
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface StructuredLogPayload {
  timestamp: string;
  level: LogLevel;
  correlationId: string;
  source: 'client' | 'server';
  event: string;
  metrics?: Partial<Record<WebVitalMetric['name'], number>>;
  context?: {
    pathname?: string;
    userAgent?: string;
    viewport?: { width: number; height: number };
    memoryHeapLimitMb?: number;
    memoryUsedMb?: number;
  };
  details?: Record<string, unknown>;
}
