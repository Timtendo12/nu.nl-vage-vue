<template>
  <app-target-link v-if="block.target" class="widget" :target="block.target">
    <app-icon v-if="icon" :embed-alt="imageAlt" embed class="widget__icon">
      <component :is="icon" />
    </app-icon>
    {{ block.label }}
  </app-target-link>
</template>

<script setup lang="ts">
import { isGraphic, WidgetBarIcon } from 'perfapi';
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import { mapGraphicIcon } from '@/components/icons';

const props = defineProps<{
  block: WidgetBarIcon;
}>();

const image = computed(() => {
  if (props.block?.image) {
    return isGraphic(props.block?.image) ? props.block?.image : null;
  } else {
    return null;
  }
});

const imageAlt = computed(() => {
  if (image.value?.name?.includes('weather')) {
    return `Weer, ${image.value?.title?.toLowerCase()}`;
  }
  return image.value?.title || props.block.label;
});

const icon = computed(() => mapGraphicIcon(image.value?.name));
</script>

<style lang="postcss">
.widget {
  display: flex;
  flex: 1 0 20%;
  flex-flow: column nowrap;
  gap: var(--grid-base--x2);
  align-items: center;
  justify-content: top;
  padding: 2px 0;
  font-size: var(--font-size-subline--s0);
  text-align: center;
  border: 1px solid transparent;
  border-radius: var(--border-radius);

  &:hover {
    border-color: var(--color-dark-blue-one);
  }
}
/* stylelint-disable */
[data-theme='dark'] {
  .widget {
    &:hover {
      border-color: var(--color-grey-three-raw);
    }
  }
}
</style>
