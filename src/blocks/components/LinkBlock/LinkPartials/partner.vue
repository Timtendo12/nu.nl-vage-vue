<template>
  <div class="item-partner">
    <span class="item-partner__caption">{{ caption }}</span>
    <AppImage v-if="imageUrl" :url="imageUrl" :alt="imageAlt" :title="imageAlt" class="item-partner__image" />
  </div>
</template>

<script setup lang="ts">
import { Image } from 'perfapi';
import { computed } from 'vue';

import AppImage from '@/components/AppImage.vue';

const props = defineProps<{ caption: string; image?: Image }>();

const imageUrl = computed(() => props.image?.url);
const imageAlt = computed(() => props.image?.title);
</script>

<style lang="postcss">
.item-partner {
  display: flex;
  flex: auto;
  align-items: center;
  justify-content: space-between;

  &__caption {
    font-size: 0.875rem;
    font-weight: 400;
    line-height: calc(16 / 14);
  }

  &__image {
    width: auto;
    max-width: 50px;
    height: auto;
    max-height: 30px;
    margin-left: var(--grid-base--x2);
  }

  &:empty {
    &::before {
      display: block;
      width: 70%;
      height: 1.1875rem;
      content: '';
      background-color: var(--color-bg--z2);
    }
  }
}
</style>
