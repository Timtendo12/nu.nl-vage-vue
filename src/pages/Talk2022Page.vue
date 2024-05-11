<template>
  <div class="app-wrapper app-wrapper--talk2022page">
    <Talk2022Block :talk2022-server-data="{ count: count, enabled: true }" is-component-page />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Talk2022Block from '@/blocks/components/Talk2022Block/Talk2022Block.vue';
import { useNuJijStore } from '@/stores/nujij';

import { useTrackedPage } from './trackedPage';

const nujijStore = useNuJijStore();
const count = computed(() => nujijStore.count);

useTrackedPage();
</script>

<style lang="postcss">
.app-wrapper--talk2022page {
  padding: var(--grid-base--x4);
}
</style>
