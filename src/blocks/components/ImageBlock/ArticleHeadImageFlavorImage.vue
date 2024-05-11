<template>
  <app-figure overlay :aspect-ratio="block.image?.viewAspectRatio" class="image-header-block">
    <template #image>
      <app-image v-if="block.image" v-bind="block.image" aria-hidden />
    </template>

    <template #caption>
      <h1 class="image-header-block__title">
        <span v-if="label" class="image-header-block__label">{{ label }}</span>
        {{ articleTitle }}
      </h1>
    </template>
  </app-figure>
</template>

<script setup lang="ts">
import { ArticleHeadImageFlavor, ImageBlock as ImageBlockType } from 'perfapi';
import { computed } from 'vue';

import AppFigure from '@/components/AppFigure.vue';
import AppImage from '@/components/AppImage.vue';
import { usePriorityLoading } from '@/utils/preloadClientSide';

const props = defineProps<{
  block: ImageBlockType;
  nested?: boolean;
}>();

const label = computed(() => (props.block.imageFlavor as ArticleHeadImageFlavor).label?.text);
const articleTitle = computed(() => (props.block.imageFlavor as ArticleHeadImageFlavor).title?.text);

if (props.block.image?.url) {
  usePriorityLoading(new URL(props.block.image.url));
}
</script>

<style lang="postcss">
.image-header-block {
  &__title {
    display: flex;
    flex-flow: column nowrap;
    margin: 0;
    font-size: 1.125rem;
    line-height: calc(24 / 18);
    color: var(--color-white-one);
  }

  &__label {
    align-self: flex-start;
    padding: var(--grid-base) var(--grid-base--x3);
    margin-bottom: var(--grid-base--x4);
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold);
    line-height: calc(14 / 12);
    text-shadow: none;
    background-color: var(--color-label-one);
    border-radius: var(--border-radius--double);
  }
}

@media (--two-columns-fit) {
  .image-header-block {
    &__title {
      font-size: 1.375rem;
      line-height: calc(28 / 22);
    }
  }
}
</style>
