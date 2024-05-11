import { createTestingPinia } from '@pinia/testing';
import { Client } from 'perfapi';
import { createPinia, PiniaPluginContext } from 'pinia';
import { markRaw } from 'vue';

import { createMockBffFetch } from '@/utils/bfffetch';
import { InMemoryCacheProvider } from '@/utils/cacheProvider';
import { MockMetricsService } from '@/utils/metricsService';

export const createPiniaStore = createPinia;

export function createMockPinia() {
  return createTestingPinia({ plugins: [mockedPiniaPlugin], stubActions: false });
}

export function mockedPiniaPlugin(context: PiniaPluginContext) {
  const mockBFFClient = new Client('', createMockBffFetch());
  const mockMetricsService = new MockMetricsService();
  const mockCacheProvider = new InMemoryCacheProvider();
  context.store.bffClient = markRaw(mockBFFClient);
  context.store.metricsService = markRaw(mockMetricsService);
  context.store.cacheProvider = markRaw(mockCacheProvider);
}
