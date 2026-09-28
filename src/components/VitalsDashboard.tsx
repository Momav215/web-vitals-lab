'use client';

import { useEffect, useState } from 'react';
import { StructuredLogger, getOrCreateCorrelationId } from '@/lib/logger';
import { formatMetricValue, rateMetric } from '@/lib/vitals';
import type { MetricRating, StructuredLogPayload, WebVitalMetric } from '@/lib/types';

type MetricName = 'LCP' | 'INP' | 'CLS';

const EMPTY: Record<MetricName, { value: number | null; rating: MetricRating | 'pending' }> = {
  LCP: { value: null, rating: 'pending' },
  INP: { value: null, rating: 'pending' },
  CLS: { value: null, rating: 'pending' },
};

export function VitalsDashboard() {
  const [metrics, setMetrics] = useState(EMPTY);
  const [logs, setLogs] = useState<StructuredLogPayload[]>([]);
  const [shifted, setShifted] = useState(false);
  const correlationId = getOrCreateCorrelationId();

  useEffect(() => {
    const unsubscribe = StructuredLogger.subscribe((entry) => {
      setLogs(StructuredLogger.getRecentLogs());
      if (entry.metrics) {
        setMetrics((current) => {
          const next = { ...current };
          (Object.keys(entry.metrics ?? {}) as MetricName[]).forEach((name) => {
            const value = entry.metrics?.[name];
            if (typeof value === 'number') {
              next[name] = { value, rating: rateMetric(name, value) };
            }
          });
          return next;
        });
      }
    });

    StructuredLogger.emit('info', 'session.start');
    observeVitals();
    return unsubscribe;
  }, []);

  function record(name: WebVitalMetric['name'], value: number) {
    StructuredLogger.emit('info', `vital.${name.toLowerCase()}`, { value }, { [name]: value });
  }

  function observeVitals() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const lcp = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry | undefined;
        if (last) record('LCP', last.startTime);
      });
      lcp.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      /* observer unsupported */
    }

    try {
      let cls = 0;
      const shifts = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') cls += entry.value;
        }
        record('CLS', Number(cls.toFixed(3)));
      });
      shifts.observe({ type: 'layout-shift', buffered: true });
    } catch {
      /* observer unsupported */
    }

    try {
      let worst = 0;
      const interactions = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { duration: number }>) {
          worst = Math.max(worst, entry.duration);
        }
        if (worst > 0) record('INP', worst);
      });
      interactions.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
    } catch {
      /* observer unsupported */
    }
  }

  function blockMainThread() {
    const started = performance.now();
    const until = started + 240;
    while (performance.now() < until) {
      Math.sqrt(Math.random());
    }
    const duration = performance.now() - started;
    record('INP', duration);
    StructuredLogger.emit('warn', 'synthetic.long-task', { durationMs: Math.round(duration) });
  }

  function causeLayoutShift() {
    setShifted(true);
    StructuredLogger.emit('warn', 'synthetic.layout-shift');
  }

  return (
    <>
      <p className="corr" data-testid="correlation-id">
        correlation id: {correlationId}
      </p>
      <section className="grid" aria-label="Метрики">
        {(Object.keys(metrics) as MetricName[]).map((name) => {
          const metric = metrics[name];
          return (
            <article className="card" key={name} data-testid={`metric-${name}`}>
              <div className="metric-name">{name}</div>
              <div className="metric-value">
                {metric.value === null ? '—' : formatMetricValue(name, metric.value)}
              </div>
              <div className={`rating ${metric.rating}`}>{metric.rating}</div>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <h2>Синтетические сценарии</h2>
        <div className="actions">
          <button type="button" onClick={blockMainThread} data-testid="long-task">
            Длинная задача (INP)
          </button>
          <button type="button" onClick={causeLayoutShift} data-testid="layout-shift">
            Сдвиг макета (CLS)
          </button>
        </div>
        {shifted ? <p className="shift-target">Блок вставлен после клика и сдвигает контент ниже.</p> : null}
      </section>

      <section className="panel" style={{ marginTop: 12 }}>
        <h2>Structured log</h2>
        <pre className="log" data-testid="log">
          {logs.length === 0
            ? 'Ожидание событий…'
            : logs
                .map((entry) => `${entry.timestamp} ${entry.level} ${entry.event} ${entry.correlationId}`)
                .join('\n')}
        </pre>
      </section>
    </>
  );
}
