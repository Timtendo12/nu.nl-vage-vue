<template>
  <component :is="component" :target="linkTarget" :class="classList" :gtm-link-attributes="gtmLinkAttributes">
    <div class="title-wrapper">
      <link-partial-partner v-if="byline && brandImage" :caption="byline" :image="brandImage" />
      <span v-else-if="byline" class="item-byline">{{ byline }}</span>
      <link-partial-title :title="block.link?.title?.text" :label="label" :meta="meta" />
    </div>

    <link-partial-thumb :url="imageUrl" :title="imageAlt" :media-duration="estimatedDuration" media-aspect="8:7" />
  </component>
</template>

<script setup lang="ts">
import { GenericImage, SmallArticleLinkFlavor } from 'perfapi';
import { computed } from 'vue';

import LinkPartialPartner from '@/blocks/components/LinkBlock/LinkPartials/partner.vue';
import LinkPartialThumb from '@/blocks/components/LinkBlock/LinkPartials/thumb.vue';
import LinkPartialTitle from '@/blocks/components/LinkBlock/LinkPartials/title.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<
  LinkBlockProps & {
    meta?: string;
    mediaSize?: string;
    mediaAspect?: string;
    hasMarker?: boolean;
  }
>();

let image: GenericImage;
const linkFlavor = props.block.link?.linkFlavor as SmallArticleLinkFlavor | undefined;
if (linkFlavor?.image) {
  image = linkFlavor.image as GenericImage;
}

const imageUrl = computed(() => image?.url);

const imageAlt = computed(() => image?.title || props.block.link?.title?.text || undefined);
const label = computed(() => linkFlavor?.label?.text);

const linkTarget = computed(() => props.block.link?.target);
const component = computed(() => (linkTarget.value ? AppTargetLink : 'span'));

const byline = computed(() => linkFlavor?.byline?.text);

const estimatedDuration = computed(() => linkFlavor?.estimatedDuration);

const brandImage = computed(() => linkFlavor?.brandIcon);

const classList = computed(() => {
  const classes = ['link-block', 'link-block--datetime'];
  if (props.showReadState) classes.push('link-block--read-state');
  return classes;
});
</script>

<style lang="postcss">
.link-block--datetime {
  --thumbnail-max-width: 6.25rem;

  position: relative;
  display: flex;
  gap: var(--grid-base--x2);
  width: 100%;
  padding: 0;
  margin: 0 0 var(--grid-base--x4) 0;

  &:hover,
  &:focus {
    text-decoration: underline;
  }

  &:last-child {
    margin-bottom: 0;
  }

  .title-wrapper {
    display: flex;
    flex: 1 1 auto;
    flex-flow: column wrap;
    gap: var(--grid-base);
    align-self: stretch;
    width: 100%;
    overflow: hidden;
  }

  .item-byline {
    font-size: 0.875rem;
    font-weight: 400;
    line-height: calc(16 / 14);
    color: var(--color-grey-five);
  }

  .item-thumb {
    flex: 0 0 var(--thumbnail-max-width);

    & + .title-wrapper {
      margin-left: var(--grid-base--x4);
    }
  }

  .item-partner {
    flex-grow: 0;
    font-size: 0.875rem;
  }

  .item-title {
    flex: auto;
    align-self: center;
    width: 100%;
  }

  .item-title__meta {
    margin-top: var(--grid-base);
    line-height: 1.3em;
  }
}
</style>
