<template>
  <component :is="tag">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { provide } from 'vue';

import { usePriorityLoadContext } from '@/utils/preloadClientSide';

const props = defineProps<{
  tag: string;
  gtmLocation: string;
  preloadFirstCandidate?: boolean;
}>();

if (props.preloadFirstCandidate) {
  usePriorityLoadContext();
}

provide('gtmLocation', props.gtmLocation);
</script>
