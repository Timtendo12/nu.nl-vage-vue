<template>
  <component
    :is="component"
    :target="linkTarget"
    class="link-block link-block--hero image-block--stretched"
    :gtm-link-attributes="gtmLinkAttributes"
  >
    <app-figure overlay :aspect-ratio="1.7777777777777777">
      <template #image>
        <app-image v-if="imageUrl" :url="imageUrl" :alt="imageAlt" :aria-hidden="isImageAltSameAsTitle" />
      </template>
      <template #caption>
        <span class="link-block__title">
          <span v-if="label" class="link-block__label">{{ label }}</span>
          {{ props.block.link?.title?.text }}
        </span>
      </template>
    </app-figure>
  </component>
</template>

<script setup lang="ts">
import { GenericImage, LargeArticleLinkFlavor } from 'perfapi';
import { computed } from 'vue';

import AppFigure from '@/components/AppFigure.vue';
import AppImage from '@/components/AppImage.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import { usePriorityLoading } from '@/utils/preloadClientSide';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps & { mediaSize?: string; mediaAspect?: string }>();

let image: GenericImage;
const linkFlavor = props.block.link?.linkFlavor as LargeArticleLinkFlavor | undefined;
if (linkFlavor?.image) {
  image = linkFlavor.image as GenericImage;
}

const imageUrl = computed(() => image?.url);

if (imageUrl.value) {
  usePriorityLoading(new URL(imageUrl.value));
}

const imageAlt = computed(() => image?.title || props.block.link?.title?.text || undefined);
const label = computed(() => linkFlavor?.label?.text);
const isImageAltSameAsTitle = computed(() => imageAlt.value === props.block.link?.title?.text);

const linkTarget = computed(() => props.block.link?.target);
const component = computed(() => (linkTarget.value ? AppTargetLink : 'span'));
</script>

<style lang="postcss">
.link-block--hero {
  .link-block {
    &__title {
      display: flex;
      flex-flow: column nowrap;
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
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
}

@media (--two-columns-fit) {
  .link-block--hero {
    .link-block {
      &__title {
        font-size: 1.375rem;
        line-height: calc(28 / 22);
      }
    }
  }
}

@media (prefers-contrast: more) {
  .link-block--hero {
    .link-block {
      &__label {
        background-color: var(--color-red-one);
      }
    }
  }
}
</style>
