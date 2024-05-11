<template>
  <div class="app-wrapper">
    <BlockResolver v-for="block in blocks" :key="block.id" :block="block" />
  </div>
</template>

<script setup lang="ts">
import { Block, BlockPage, Screen } from 'perfapi';
import { debounce } from 'ts-debounce';
import { computed, onBeforeUnmount, onMounted, onUnmounted, provide, watch, WatchStopHandle } from 'vue';

import BlockResolver from '@/blocks/BlockResolver.vue';
import { useContentHeight } from '@/composables/content-height/use-content-height';
import { useContentStore } from '@/stores/content';
import { Theme, usePreferencesStore } from '@/stores/preferences';
import { onBlocks, onTheme, sendHeight, sendReady } from '@/utils/bridge';

let unwatchOnBlocks: (() => void) | null = null;
let unwatchOnTheme: (() => void) | null = null;

const preferencesStore = usePreferencesStore();

const contentStore = useContentStore();
const { contentHeight } = useContentHeight();
let unwatchOnHeight: WatchStopHandle | undefined;

const blocks = computed(() => contentStore.blocksMain);

provide('UpdateImmediately', true);

onMounted((): void => {
  unwatchOnBlocks = onBlocks((blocks: Block[]): void => {
    const screen = {
      id: 'screen for provided blocks',
      firstBlockPage: { blocks } as BlockPage,
    } as Screen;
    contentStore.setBlockParents(screen);
  });

  unwatchOnTheme = onTheme((theme: Theme): void => {
    preferencesStore.setTheme(theme);
  });

  // informing mobile app that endpoint is ready
  sendReady({});

  unwatchOnHeight = watch(
    contentHeight,
    // @ts-expect-error - Vue watch doesn't like the debounce library as a callback
    debounce((newValue) => {
      sendHeight({ height: newValue });
    }, 100),
  );
});

onUnmounted((): void => {
  unwatchOnBlocks?.();
  unwatchOnBlocks = null;
  unwatchOnTheme?.();
  unwatchOnTheme = null;
});

onBeforeUnmount(() => {
  unwatchOnHeight?.();
});
</script>
