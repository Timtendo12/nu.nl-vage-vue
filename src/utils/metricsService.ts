import { MetricsService } from '@server/services/metricsServices';
import { Tags } from 'hot-shots';
import { inject, InjectionKey } from 'vue';

export const useMetricsService = (): MetricsService => {
  const metricsService = inject<MetricsService>(metricsServiceKey);
  if (!metricsService) throw new Error('MetricsService not registered.');
  return metricsService;
};

export class BrowserBasedMetricsService implements MetricsService {
  asyncTimer<T>(asyncFn: () => Promise<T>, stat: string): () => Promise<T> {
    console.log(stat);
    return asyncFn;
  }

  timing(stat: string, time: number | Date): void {
    console.log(stat, time);
  }

  createTimer(): () => number {
    const start = new Date();
    return () => new Date().getTime() - start.getTime();
  }

  increment(stat: string | string[], value: number, _sampleRate?: number | undefined, tags?: Tags | undefined): void {
    console.log({ stat, value, tags });
  }
}

export class MockMetricsService implements MetricsService {
  asyncTimer<T>(asyncFn: () => Promise<T>): () => Promise<T> {
    return asyncFn;
  }

  timing(): void {
    return;
  }

  createTimer(): () => number {
    return () => 0;
  }

  increment(): void {
    return;
  }
}

export const metricsServiceKey: InjectionKey<MetricsService> = Symbol('metricsService');
