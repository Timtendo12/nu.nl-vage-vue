import { CacheProvider } from '@server/services/cacheProviders';
import { MetricsService } from '@server/services/metricsServices';
import { Client } from 'perfapi';
import { _ActionsTree, _GettersTree, StateTree, Store } from 'pinia';
import { markRaw } from 'vue';

import { BrowserCacheProvider } from '@/utils/cacheProvider';
import { BrowserBasedMetricsService } from '@/utils/metricsService';

export const piniaPlugin = (
  store: Store<string, StateTree, _GettersTree<StateTree>, _ActionsTree>,
  bffClient: Client,
  metricsService: MetricsService | BrowserBasedMetricsService,
  cacheProvider: CacheProvider | BrowserCacheProvider,
) => {
  store.bffClient = markRaw(bffClient);
  store.metricsService = markRaw(metricsService);
  store.cacheProvider = markRaw(cacheProvider);
};
