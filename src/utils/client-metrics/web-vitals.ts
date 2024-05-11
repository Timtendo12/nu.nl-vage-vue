import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric as VitalMetrics } from 'web-vitals';

import { makePayload, MetricType, sendMetrics } from '@/utils/client-metrics/tools';

const senderForType = (type: MetricType): ((metric: VitalMetrics) => void) =>
  function (metric: VitalMetrics) {
    sendMetrics(makePayload([{ key: type, value: metric.value }]));
  };

export const initWebVitals = (): void => {
  getCLS(senderForType(MetricType.CLS));
  getFID(senderForType(MetricType.FID));
  getLCP(senderForType(MetricType.LCP));
  getFCP(senderForType(MetricType.FCP));
  getTTFB(senderForType(MetricType.TTFB));
};
