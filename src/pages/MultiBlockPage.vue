<template>
  <div class="app-wrapper app-wrapper--multiblock">
    <notification
      v-if="inFallbackMode"
      title="Omdat het druk is, werken sommige functies niet. We werken aan een oplossing."
    />
    <Banner class="h1" :slot-name="'h1'" />
    <BlockResolver v-for="block in blocksMain" :key="block.id" :block="block" />
    <Banner class="h2" :slot-name="'h2'" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onServerPrefetch, toRefs, watch, WatchStopHandle } from 'vue';

import BlockResolver from '@/blocks/BlockResolver.vue';
import Banner from '@/components/Banner.vue';
import Notification from '@/components/Notification.vue';
import { usePym } from '@/composables/pym/use-pym';
import { useContentStore } from '@/stores/content';
import { useContextStore } from '@/stores/context';
import { Theme, usePreferencesStore } from '@/stores/preferences';

import { useTrackedPage } from './trackedPage';

const props = defineProps<{ slug: string }>();

const { inFallbackMode } = useContextStore();
const { slug } = toRefs(props);
const preferencesStore = usePreferencesStore();
const contentStore = useContentStore();

const blocksMain = computed(() => contentStore.blocksMain);
const getScreen = (): Promise<void> => contentStore.getScreenByEntryPoint(slug?.value);
const blocksMainLength = computed(() => contentStore.blocksMain.length);

let unwatchSlug: WatchStopHandle | undefined;
let unwatchTheme: WatchStopHandle | undefined;

useTrackedPage();

onMounted((): void => {
  const { theme } = usePym();
  unwatchTheme = watch(theme, (value) => {
    preferencesStore.setTheme(value as Theme);
  });

  unwatchSlug = watch(slug, (): void => {
    getScreen();
  });
  if (!blocksMainLength.value) {
    getScreen();
  }
});

onBeforeUnmount(() => {
  unwatchSlug?.();
  unwatchTheme?.();
});

onServerPrefetch(() => getScreen());
</script>

<style lang="postcss">
.app-wrapper--multiblock {
  padding: var(--grid-base--x4);

  & > * {
    margin-bottom: var(--grid-base--x4);
  }
}
</style>
