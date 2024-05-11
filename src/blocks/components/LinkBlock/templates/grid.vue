<template>
  <component :is="component" :target="linkTarget" :class="classList" :gtm-link-attributes="gtmLinkAttributes">
    <link-partial-thumb
      v-if="imageUrl"
      :url="imageUrl"
      :title="imageAlt"
      :media-duration="estimatedDuration"
      media-aspect="16:9"
    />

    <div class="title-wrapper">
      <link-partial-title :title="props.block.link?.title?.text" :label="label" :meta="meta" />
      <link-partial-partner v-if="byline && isPartner" :caption="byline" :image="brandImage" />
      <app-icon v-if="hasMarker && !imageUrl" embed class="item-marker">
        <icon-chevron-right />
      </app-icon>
    </div>
  </component>
</template>

<script setup lang="ts">
import { GenericImage, isVideoTarget, SmallArticleLinkFlavor } from 'perfapi';
import { computed } from 'vue';

import LinkPartialPartner from '@/blocks/components/LinkBlock/LinkPartials/partner.vue';
import LinkPartialThumb from '@/blocks/components/LinkBlock/LinkPartials/thumb.vue';
import LinkPartialTitle from '@/blocks/components/LinkBlock/LinkPartials/title.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';

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

const byline = computed(() => {
  if (isVideoTarget(linkTarget.value)) {
    return;
  }
  return linkFlavor?.byline?.text;
});

const estimatedDuration = computed(() => linkFlavor?.estimatedDuration);
const brandImage = computed(() => linkFlavor?.brandIcon);

const classList = computed(() => [
  'link-block',
  'link-block--grid',
  props.showReadState ? 'link-block--read-state' : null,
]);
</script>

<style lang="postcss">
.link-block--grid {
  display: flex;
  flex-flow: column wrap;

  .item--thumb {
    flex: 0 0 auto;
    width: 100%;
    padding: 0;
    margin-bottom: 0;
    overflow: hidden;
  }

  .title-wrapper {
    margin-left: 0;
  }

  .item-title {
    align-self: inherit;
    padding-top: var(--grid-base--x4);
    margin-left: 0;
  }

  &:hover,
  &:focus {
    .item-title {
      text-decoration: underline;
    }
  }
}
</style>
