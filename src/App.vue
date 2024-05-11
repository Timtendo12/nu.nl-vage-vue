<template>
  <div id="app__container" :class="templated('app-wrapper')">
    <AppModalLayer>
      <router-view></router-view>
    </AppModalLayer>
  </div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, watch, WatchStopHandle } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { sendNavigate, usePym } from '@/composables/pym/use-pym';

import AppModalLayer from './components/AppModal/AppModalLayer.vue';
import { isInAppViewKey } from './utils/environment';

// Pym integration
const { navigate } = usePym();

// Template method
const templated = (baseClass: string): string[] => {
  const classes = [baseClass];
  const route = useRoute();
  const template = route.query.template;
  if (template) classes.push(`${baseClass}-${template}`);
  const isInAppView = inject(isInAppViewKey);
  if (isInAppView) classes.push(`${baseClass}--in-app-view`);
  return classes;
};

let unwatchNavigate: WatchStopHandle | undefined;
let unwatchUserToken: WatchStopHandle | undefined;

onMounted(() => {
  const router = useRouter();
  unwatchNavigate = watch(navigate, (newVal: string): void => {
    // When user navigate back in history parent frame will update `navigate` property.
    // To break the cycle and not notify parent about route changes we pass append `skip`
    // in the path to the router which will transform it to a meta parameter
    // and notification won't be propagated back the parent.
    const path = newVal.replace(/^\/|\/$/g, ''); // removing leading and trailing slashes
    router.push(`/component/${path}/skip`);
  });
  // [!] is it possible to unsubscribe?
  router.afterEach((to) => {
    // We observe all changes in the router and propagate them to a parent frame
    // so the latest one can update URL in address bar and history.
    // In case the router was triggered by the parent itself meta will contain
    // skip property. This will allow to break cycle and don't notify parent back
    // about change.
    if (to.matched.some((record) => record.meta.skip)) {
      return;
    }
    const parts = to.path.split('/');
    const slug = parts.pop() || parts.pop();
    if (slug) {
      sendNavigate(`/${slug}`);
    }
  });
});

onBeforeUnmount(() => {
  unwatchNavigate?.();
  unwatchUserToken?.();
});
</script>
