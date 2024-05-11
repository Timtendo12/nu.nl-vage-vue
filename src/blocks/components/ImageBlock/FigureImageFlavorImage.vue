<template>
  <app-figure :aspect-ratio="block.image?.viewAspectRatio" class="image-figure-block">
    <template v-if="imageUrl" #image>
      <app-image :url="imageUrl" />
    </template>
    <template v-if="caption || copyright" #caption>
      <span v-if="caption" class="image-figure-block__caption-text">{{ caption }}</span>
      <address v-if="copyright" class="image-figure-block__copyright">Foto: {{ copyright }}</address>
    </template>
  </app-figure>
</template>

<script setup lang="ts">
import { FigureImageFlavor, ImageBlock as ImageBlockType } from 'perfapi';
import { computed } from 'vue';

import AppFigure from '@/components/AppFigure.vue';
import AppImage from '@/components/AppImage.vue';

const props = defineProps<{
  block: ImageBlockType;
}>();

const imageUrl = computed(() => props.block.image?.url);

const copyright = computed(() => (props.block.imageFlavor as FigureImageFlavor).copyright?.text);
const caption = computed(() => (props.block.imageFlavor as FigureImageFlavor).caption?.text);
</script>

<style lang="postcss">
.image-figure-block {
  &__copyright {
    display: inline;
    font-style: normal;
    font-weight: 400;
  }

  &__caption-text + &__copyright {
    &::before {
      content: ' | ';
    }
  }
}
</style>
