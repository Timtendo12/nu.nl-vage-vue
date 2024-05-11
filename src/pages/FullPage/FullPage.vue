<template>
  <main-menu-block v-if="!isInAppView" />
  <main class="page-wrapper" :class="classes">
    <banner class="h1" slot-name="h1" :show-in-single-column="!isFrontpage" />
    <banner id="v1" class="v1" slot-name="v1" />
    <column-layout :has-sidebar="sidebarPopulated">
      <template #topzone>
        <block-resolver
          v-for="[block, previousBlockData] in blocksTopzone"
          :key="block.id"
          :block="block"
          :previous-block-data="previousBlockData"
        />
      </template>
      <template #main>
        <notification
          v-if="inFallbackMode"
          title="Omdat het druk is, werken sommige functies niet. We werken aan een oplossing."
        />
        <block-resolver
          v-for="[block, previousBlockData] in blocksMain"
          :key="block.id"
          :block="block"
          :previous-block-data="previousBlockData"
        />
        <Talk2022Block :talk2022-server-data="{ count, enabled }" />
      </template>
      <template #sidebar>
        <block-resolver
          v-for="[block, previousBlockData] in blocksSidebar"
          :key="block.id"
          :block="block"
          :previous-block-data="previousBlockData"
        />
        <Banner class="r3" slot-name="r3" :show-in-single-column="false" />
      </template>
    </column-layout>
    <Banner class="h2" slot-name="h2" :show-in-single-column="!isFrontpage" />
  </main>
  <footer-menu-block v-if="!isInAppView" />
  <breaking-push-modal v-if="!isInAppView && !inFallbackMode" />
</template>

<script setup lang="ts">
import { OutputMode } from '@server/middleware/OutputMode';
import Cookies from 'js-cookie';
import { Block, isContentListContainer, isDataLayerScreenViewEvent, isLiveDataConnectionAction } from 'perfapi';
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch,
  onUpdated,
  toRefs,
  watch,
  watchEffect,
  WatchStopHandle,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BlockResolver from '@/blocks/BlockResolver.vue';
import FooterMenuBlock from '@/blocks/components/FooterMenuBlock.vue';
import MainMenuBlock from '@/blocks/components/MainMenuBlock.vue';
import Talk2022Block from '@/blocks/components/Talk2022Block/Talk2022Block.vue';
import Banner from '@/components/Banner.vue';
import BreakingPushModal from '@/components/BreakingPushModal.vue';
import ColumnLayout from '@/components/ColumnLayout/ColumnLayout.vue';
import Notification from '@/components/Notification.vue';
import { useFirebaseRealtimeDB } from '@/composables/firebase/use-firebase';
import { usePipSso } from '@/composables/pip-sso/use-pip-sso';
import { useSkyScraper } from '@/composables/skyscraper/use-skyscraper';
import { isExtendedContainerBlock, useContentStore } from '@/stores/content';
import { useContextStore } from '@/stores/context';
import { useMenusStore } from '@/stores/menus';
import { useNuJijStore } from '@/stores/nujij';
import { usePreferencesStore } from '@/stores/preferences';
import { useUserStore } from '@/stores/user';
import { consentHasPersonalisation } from '@/utils/consent';
import { isInAppViewKey } from '@/utils/environment';
import { useGtm } from '@/utils/gtm';
import { transformDataLayerScreenViewToDictionary } from '@/utils/gtm/data-layer';
import { loadPrivacyGate, onConsentKnown, updateConsent } from '@/utils/privacyGate';
import { isVWOEnabled, runVWO } from '@/utils/vwo';

const props = defineProps<{
  path: string;
}>();

const { inFallbackMode } = useContextStore();

const { path } = toRefs(props);

const isInAppView = inject(isInAppViewKey);

const contentStore = useContentStore();
const menusStore = useMenusStore();
const userStore = useUserStore();
const nujijStore = useNuJijStore();
const preferencesStore = usePreferencesStore();
const contextStore = useContextStore();

const classes = computed(() => ({
  'page-wrapper--has-v1': true,
  [`branded branded--${contentStore.sectionTheme}`]: !!contentStore.sectionTheme,
}));
const route = useRoute();
const getScreenByPath = () => contentStore.getScreenByPath(route);

// TODO: this is a temporary solution to hide the h1 and h2 banners on the frontpage on mobile. This should be done in BFF, a new ticket has been created for this.
const isFrontpage = computed(() => route.path === '/');

const blocksMain = computed(() => mapBlocks(contentStore.blocksMain, route.path === '/' ? 'algemeen' : route.path));
const blocksSidebar = computed(() => mapBlocks(contentStore.blocksSidebar));
const blocksTopzone = computed(() => mapBlocks(contentStore.blocksTopzone));

// TODO: this is a workaround to missing tracking information from BFF/API2. Default to Algemeen on Frontpage.
const mapBlocks = (blocks: Block[], defaultHeader = '') => {
  let previousBlockData = {
    header: defaultHeader,
    blocksCount: 0,
  };

  return blocks.map((b) => {
    // copy previousBlockData into new object.
    const returnValue = [b, { ...previousBlockData }] as [Block, typeof previousBlockData];

    // only update previousBlockData when a contentListContainer is found. Otherwise skip block.
    if (isExtendedContainerBlock(b) && isContentListContainer(b.webContainerFlavor)) {
      const newHeader = b.webContainerFlavor.header;
      if (newHeader && previousBlockData.header !== newHeader) {
        previousBlockData.header = newHeader;
        previousBlockData.blocksCount = b.blocks.length;
      } else {
        // when header stays the same we must increment block count as we assume a continuation of previous list.
        previousBlockData.blocksCount = previousBlockData.blocksCount + b.blocks.length;
      }
    }

    return returnValue;
  });
};

const blocksMainLength = computed(() => contentStore.blocksMain.length);
const count = computed(() => nujijStore.count);
const enabled = computed(() => nujijStore.enabled);

const sidebarPopulated = computed(() => contentStore.blocksSidebar.length > 0);
const UID = computed(() => userStore.user?.UID);

let unwatchPath: WatchStopHandle | undefined;

usePipSso(userStore.user?.email, preferencesStore.theme);
useSkyScraper();

let unsubscribeToFirebase: () => void;

onMounted(async (): Promise<void> => {
  const gtm = useGtm();
  const router = useRouter();
  await loadPrivacyGate(gtm);
  contentStore?.screenActions?.show?.forEach((action) => {
    // This sets up a connection if f1 is rendering a liveblog with a live connection still active
    if (isLiveDataConnectionAction(action) && action.liveDataEventSource) {
      unsubscribeToFirebase = useFirebaseRealtimeDB(action.liveDataEventSource);
    }
  });

  contentStore.screenTrackers?.show?.filter(isDataLayerScreenViewEvent).forEach((t) => {
    gtm.add({
      screen_info: {
        ...transformDataLayerScreenViewToDictionary(t.fields),
        fallback: String(contextStore.outputMode == OutputMode.FALLBACK),
      },
    });
  });

  watchEffect(() => contentStore.redirectUrl && router.replace(contentStore.redirectUrl));

  onConsentKnown('marketing', (hasConsent) => {
    if (isVWOEnabled() && hasConsent) {
      runVWO();
    }
  });

  const dpgConsentString = Cookies.get('dpg-consent-string');
  if (UID.value && consentHasPersonalisation(dpgConsentString)) {
    gtm.add({ event: 'pip-account-id', 'user.account_id': UID.value });
  }

  unwatchPath = watch(path, (): void => {
    getScreenByPath();
  });

  if (!blocksMainLength.value) {
    getScreenByPath();
  }

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

onUpdated(() => {
  onConsentKnown('marketing', (hasConsent) => {
    if (isVWOEnabled() && hasConsent) {
      runVWO();
    }
  });
});

onBeforeUnmount(() => {
  unwatchPath?.();
  unsubscribeToFirebase?.();
});

onServerPrefetch(() => Promise.all([getScreenByPath(), menusStore.getMenus()]));
</script>

<style lang="postcss">
.main-nav {
  z-index: 1999999998;
}

.v1 {
  display: none;
}

.h1 {
  min-height: var(--ad-h1-min-height);
  margin-bottom: var(--grid-base--x4);
}

.h2 {
  min-height: var(--ad-h1-min-height);
  margin: var(--grid-base--x4) 0;
}

.r3 {
  max-width: var(--ad-r3-max-width);
  margin: var(--grid-base--x4) 0 var(--grid-base--x4) auto;
}

@media (--two-columns-fit) {
  .r3 {
    position: sticky;
    top: 8.75rem;
  }
}

@media (--skyscraper-threshold) {
  .v1 {
    position: sticky;
    top: 8.75rem;
    display: block;
    float: left;
    width: var(--ad-v1-wide-width);
    min-height: 37.5rem;
    margin-bottom: 100vh;
    margin-left: calc(-1 * (var(--ad-v1-wide-width) + var(--grid-base--x4)));
  }
}

@media (--skyscraper-medium-column) {
  .v1 {
    width: var(--ad-v1-medium-width);
    margin-left: calc(-1 * (var(--ad-v1-medium-width) + var(--grid-base--x4)));
  }
}
</style>
@/utils/privacyGate
