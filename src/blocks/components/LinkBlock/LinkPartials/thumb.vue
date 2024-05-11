<template>
  <figure :class="classList">
    <AppImage v-if="url" :url="url" :title="title" class="item-thumb__image" :media-aspect="mediaAspect" aria-hidden />
    <figcaption v-if="mediaDuration" class="item-thumb__icon">
      <AppIcon embed class="link-block__icon">
        <IconPlay />
      </AppIcon>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import AppImage from '@/components/AppImage.vue';
import IconPlay from '@/components/icons/IconPlay.vue';

const props = defineProps<{
  url?: string;
  title?: string;
  mediaDuration?: string;
  mediaAspect?: string;
}>();

const classList = ['item-thumb'];

if (props.mediaAspect) {
  classList.push('lazy-aspect');

  const aspectRatio = computed(() => {
    switch (props.mediaAspect) {
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
</script>

<style lang="postcss">
.item-thumb {
  position: relative;
  align-self: flex-start;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background-color: var(--color-bg--z2);
  border-radius: var(--border-radius);

  &__image {
    width: 100%;
    height: auto;
    vertical-align: top;
    object-fit: cover;
  }

  &__icon {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    padding: 0 0 var(--grid-base--x2) var(--grid-base--x2);

    .icon {
      align-self: flex-end;
      font-size: calc(var(--grid-base--x4) * 1.5);
      line-height: 0;
      color: var(--color-white-one);
    }
  }

  &__duration {
    position: absolute;
    right: var(--grid-base--x2);
    bottom: var(--grid-base--x2);
    padding: var(--grid-base);
    font-size: 0.8125rem;
    line-height: calc(15 / 13);
    color: var(--color-white-one);
    background: rgb(0 0 0 / 30%);
    border-radius: var(--border-radius--half);
  }

  .lazy-aspect {
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
}
</style>
