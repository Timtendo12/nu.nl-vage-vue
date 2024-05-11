<template>
  <main-menu-block />
  <notification
    v-if="inFallbackMode"
    title="Omdat het druk is, werken sommige functies niet. We werken aan een oplossing."
  />
  <ExternalEmbed :id="id" :url="url" lazy use-auth></ExternalEmbed>
</template>

<script setup lang="ts">
import { DataLayerScreenViewEvent } from 'perfapi';
import { onBeforeUnmount, onMounted, onServerPrefetch, watch, WatchStopHandle } from 'vue';
import { useRouter } from 'vue-router';

import MainMenuBlock from '@/blocks/components/MainMenuBlock.vue';
import ExternalEmbed from '@/components/ExternalEmbed.vue';
import Notification from '@/components/Notification.vue';
import { usePipSso } from '@/composables/pip-sso/use-pip-sso';
import { usePym } from '@/composables/pym/use-pym';
import { useContentStore } from '@/stores/content';
import { useContextStore } from '@/stores/context';
import { useMenusStore } from '@/stores/menus';
import { Theme, usePreferencesStore } from '@/stores/preferences';
import { useUserStore } from '@/stores/user';
import { onConsentKnown, updateConsent } from '@/utils/privacyGate';

import { useTrackedPage } from './trackedPage';

defineProps<{ url: string; id: string }>();

const { inFallbackMode } = useContextStore();
const preferencesStore = usePreferencesStore();
const contentStore = useContentStore();
const menusStore = useMenusStore();
const userStore = useUserStore();

let unwatchSlug: WatchStopHandle | undefined;
let unwatchTheme: WatchStopHandle | undefined;

usePipSso(userStore.user?.email, preferencesStore.theme);

// Manually set the screen trackers for the game page as we're not fetching the page data from the BFF
contentStore.setScreenTrackers({
  __typename: 'ScreenTrackers',
  show: [
    {
      __typename: 'DataLayerScreenViewEvent',
      eventName: 'screen_info',
      fields: [
        { __typename: 'DataLayerScreenViewKeyValue', key: 'account_id', value: userStore.user?.UID },
        { __typename: 'DataLayerScreenViewKeyValue', key: 'logged_in', value: !!userStore.user?.UID },
        { __typename: 'DataLayerScreenViewKeyValue', key: 'page_type', value: 'game' },
        { __typename: 'DataLayerScreenViewKeyValue', key: 'page_category', value: 'game' },
        { __typename: 'DataLayerScreenViewKeyValue', key: 'page_categorypath', value: 'home|game' },
      ],
    } as DataLayerScreenViewEvent,
  ],
});

useTrackedPage();

onMounted((): void => {
  const { theme } = usePym();
  const router = useRouter();
  unwatchTheme = watch(theme, (value) => {
    preferencesStore.setTheme(value as Theme);
  });
  onConsentKnown('analytics', () => {
    watch(
      () => router.currentRoute.value,
      (currentRoute): void => {
        const modalValue = currentRoute.query.modal;
        if (modalValue === 'cookie-instellingen') {
          try {
            const newQuery = { ...currentRoute.query };
            delete newQuery.modal; // Remove the modal parameter
            updateConsent();
            router.replace({ path: currentRoute.path, query: newQuery, hash: currentRoute.hash });
          } catch (e) {
            console.error('PRIVACY GATE: failed to open consent modal', e);
          }
        }
      },
      { immediate: true },
    );
  });
});

onBeforeUnmount(() => {
  unwatchSlug?.();
  unwatchTheme?.();
});

onServerPrefetch(() => Promise.all([menusStore.getMenus()]));
</script>

<style lang="postcss">
nav.main-nav {
  margin-bottom: 0;
}
</style>
