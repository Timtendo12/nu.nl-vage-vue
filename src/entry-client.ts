import '@/assets/css/main.css';
import '@/utils/client-metrics';
import 'normalize.css';

import Cookies from 'js-cookie';
import { Client } from 'perfapi';
import { createSSRApp } from 'vue';
import Vue3Lottie from 'vue3-lottie';

import VueApp from '@/App.vue';
import iconsPlugin from '@/components/icons/plugin';
import createRouter from '@/router';
import { bffFetch } from '@/utils/bfffetch';
import { BrowserCacheProvider, cacheProviderKey } from '@/utils/cacheProvider';
import { Gtm } from '@/utils/gtm';
import { BrowserBasedMetricsService, metricsServiceKey } from '@/utils/metricsService';

import { createPiniaStore } from './stores';
import { piniaPlugin } from './stores/plugin';
import { isInAppView, isInAppViewKey } from './utils/environment';
import { initSentryFrontend } from './utils/sentry';

const app = createSSRApp(VueApp);
app.config.performance = true;

initSentryFrontend(app);

const metricsService = new BrowserBasedMetricsService();
const bffClient = new Client(
  '/api/f1/graphql',
  bffFetch({
    getPipTokens: () => ({
      'dpg-component-at': Cookies.get('dpg-component-at'),
      'dpg-component-uit': Cookies.get('dpg-component-uit'),
      'pip-refresh-token': Cookies.get('pip-refresh-token'),
    }),
    getCookie: () => Cookies.get(),
    metricsService,
  }),
);

const cacheProvider = new BrowserCacheProvider();

const decodedState = decodeURIComponent(window.__INITIAL_STATE__);
const router = createRouter('client');
const gtm = new Gtm();

app.provide(metricsServiceKey, metricsService);
app.provide(cacheProviderKey, cacheProvider);
app.provide(isInAppViewKey, isInAppView(window.navigator.userAgent));
app.provide('bffClient', bffClient);

app.use(router);
const pinia = createPiniaStore();
app.use(pinia);
pinia.state.value = JSON.parse(decodedState);
pinia.use(({ store }) => {
  piniaPlugin(store, bffClient, metricsService, cacheProvider);
});
app.use(gtm);
app.use(iconsPlugin);
app.use(Vue3Lottie);

router.isReady().then((): void => {
  app.mount('#app', true);
});
