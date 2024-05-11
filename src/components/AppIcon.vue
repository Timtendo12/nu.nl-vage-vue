<template>
  <AppImage v-if="icon && icon.url" :url="icon.url" :description="icon.description" :title="icon.title" class="icon" />
  <i v-else-if="embed" class="icon">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${viewboxWidth} ${viewboxHeight}`"
      :aria-labelledby="embedAlt"
      :alt="embedAlt"
      role="img"
      :style="iconSizing"
    >
      <title lang="nl">{{ embedAlt }}</title>
      <g>
        <slot />
      </g>
    </svg>
  </i>
</template>

<script setup lang="ts">
import { Image } from 'perfapi';
import { computed, ComputedRef } from 'vue';

import AppImage from '@/components/AppImage.vue';

const props = withDefaults(
  defineProps<{
    icon?: Image;
    embed?: boolean;
    embedAlt?: string;
    width?: string;
    height?: string;
    viewboxWidth?: string;
    viewboxHeight?: string;
    iconColor?: string;
  }>(),
  {
    icon: undefined,
    embedAlt: '',
    embed: false,
    width: '24',
    height: '24',
    viewboxWidth: '24',
    viewboxHeight: '24',
    iconColor: 'currentColor',
  },
);

const iconSizing: ComputedRef<string> = computed(() => `width: ${props.width}px; height: ${props.height}px;`);
</script>

<style lang="postcss">
.icon {
  align-self: center;
}
</style>
