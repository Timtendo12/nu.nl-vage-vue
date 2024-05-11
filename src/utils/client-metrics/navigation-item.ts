import { makePayload, MetricType, sendMetrics } from '@/utils/client-metrics/tools';

export const initNavigationItem = (): void => {
  // submit payload once window is loaded
  if (window.performance === undefined || window.performance.getEntriesByType === undefined) {
    return;
  }
  addEventListener('load', () => {
    const timing = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (timing === undefined) {
      return;
    }
    // Metrics server is expecting only these values,
    // everything else will be filtered out
    const metrics = [
      { key: MetricType.requestStart, value: timing.requestStart },
      { key: MetricType.responseEnd, value: timing.responseEnd },
      { key: MetricType.domInteractive, value: timing.domInteractive },
      {
        key: MetricType.domContentLoaded,
        value: timing.domContentLoadedEventStart,
      },
      { key: MetricType.domComplete, value: timing.domComplete },
    ];
    sendMetrics(makePayload(metrics));
  });
};
