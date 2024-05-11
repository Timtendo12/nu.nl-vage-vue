<template>
  <img :src="url" :alt="alt || description || title" loading="lazy" :class="classList" :aria-hidden="ariaHidden" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  id?: string;
  description?: string;
  title?: string;
  alt?: string;
  url: string;
  viewAspectRatio?: number;
  mediaAspect?: string;
  ariaHidden?: boolean;
}>();

const classList = computed(() => {
  const classList = ['app-image'];
  let mediaAspect = props.mediaAspect;
  if (!mediaAspect && props.viewAspectRatio) {
    mediaAspect = {
      [1.77777]: '16:9',
      [1.33333]: '4:3',
      [1.14285]: '8:7',
      [0.75]: '3:4',
      [2]: '2:1',
      [1]: '1:1',
    }[props.viewAspectRatio];
  }

  if (mediaAspect) {
    classList.push('lazy-aspect');

    const aspectRatio = computed(() => {
      switch (mediaAspect) {
        case '16:9':
          return '16by9';
        case '4:3':
          return '4by3';
        case '8:7':
          return '8by7';
        case '3:4':
          return '3by4';
        case '2:1':
          return '2by1';
        case '1:1':
          return '1by1';
        default:
          return false;
      }
    });

    aspectRatio.value ? classList.push('lazy-aspect--' + aspectRatio.value) : null;
  }
  return classList;
});
</script>

<style lang="postcss">
.app-image {
  vertical-align: middle;
}

.lazy-aspect {
  display: block;

  &--16by9 {
    aspect-ratio: 16/9;
  }

  &--4by3 {
    aspect-ratio: 4/3;
  }

  &--8by7 {
    aspect-ratio: 8/7;
  }

  &--3by4 {
    aspect-ratio: 3/4;
  }

  &--2by1 {
    aspect-ratio: 2/1;
  }

  &--1by1 {
    aspect-ratio: 1/1;
  }
}
</style>
