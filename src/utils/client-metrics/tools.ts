import { getEnvVariable } from '@/utils/config';
import { isMobile } from '@/utils/environment';

export enum MetricType {
  requestStart = 'request-start',
  responseEnd = 'response-end',
  domInteractive = 'dom-interactive',
  domContentLoaded = 'dom-content-loaded',
  domComplete = 'dom-complete',
  CLS = 'cumulative-layout-shift',
  FID = 'first-input-delay',
  LCP = 'largest-contentful-paint',
  FCP = 'first-contentful-paint',
  TTFB = 'time-to-first-byte',
}

export type Metric = {
  key: string;
  value: number;
  labels?: {
    context: string;
  };
};

// http://wicg.github.io/netinfo/#effectiveconnectiontype-enum
type EffectiveConnectionType = '2g' | '3g' | '4g' | 'slow-2g';
interface ExperimentalNetworkInformation extends NetworkInformation {
  // http://wicg.github.io/netinfo/#effectivetype-attribute
  readonly effectiveType?: EffectiveConnectionType;
}

export const isArticle = (path: string): boolean => /^\/(\w|-)*\/\d+\/(\w|-)*\.html$/.test(path);

export const isFrontPage = (path: string): boolean => /^$/.test(path);

export const isPage = (path: string): boolean => /^\/(\w|-)*\.html$/.test(path);

export const isSection = (path: string): boolean => /^\/(\w|-)*$/.test(path);

export const isTag = (path: string): boolean => /^\/tag\/(\w|-)*$/.test(path);

export const isVideo = (path: string): boolean => /^\/\d+\/video\/(\w|-)*\.html$/.test(path);

export const isWidget = (path: string): boolean => /^(\/(component)\/|\/)(verkeer|brandstof|trein)$/.test(path);

export const getContext = (): string => {
  const validators: {
    predicate: (path: string) => boolean;
    context: string;
  }[] = [
    // Check for widget should go the first because
    // it will be recognized like a section
    { predicate: isWidget, context: 'widget' },
    { predicate: isArticle, context: 'article' },
    { predicate: isFrontPage, context: 'frontpage' },
    { predicate: isPage, context: 'page' },
    { predicate: isSection, context: 'section' },
    { predicate: isTag, context: 'tag' },
    { predicate: isVideo, context: 'video' },
  ];
  const pathname = location.pathname.replace(/\/+$/, '');
  for (const { predicate, context } of validators) {
    if (predicate(pathname)) {
      return context;
    }
  }
  return 'unknown';
};

export const enrichMetrics = (metrics: Metric[]): Metric[] => {
  const context = getContext();
  return metrics.map<Metric>((metric) => ({
    ...metric,
    labels: {
      context,
    },
  }));
};

export const makePayload = (metrics: Metric[]): Record<string, unknown> => ({
  device: 'web',
  os: { platform: navigator.platform },
  build: getEnvVariable('VITE_REVISION'),
  environment: getEnvVariable('VITE_ENVIRONMENT'),
  network: (navigator?.connection as ExperimentalNetworkInformation | undefined)?.effectiveType,
  formFactor: isMobile() ? 'mobile' : 'desktop',
  metrics: enrichMetrics(metrics),
});

export const sendMetrics = (payload: Record<string, unknown>): void => {
  const url = getEnvVariable('VITE_METRICS_URL');
  if (!url) return;
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    });
  }
};
