<template>
  <component :is="component" :target="linkTarget" :class="classList" :gtm-link-attributes="gtmLinkAttributes">
    <link-partial-thumb
      v-if="showThumb"
      :url="imageUrl"
      :title="imageAlt"
      :media-duration="estimatedDuration"
      media-aspect="8:7"
    />

    <div ref="linkEl" class="title-wrapper">
      <link-partial-title :title="props.block?.link?.title?.text" :label="label" :label-inline="false" :meta="meta" />
      <link-partial-partner v-if="byline && brandImage" :caption="byline" :image="brandImage" />
      <span v-else-if="byline" class="item-byline">{{ byline }}</span>
      <app-icon v-if="thumbOptional && hasMarker && !imageUrl" embed class="item-marker">
        <icon-chevron-right />
      </app-icon>
    </div>
  </component>
</template>

<script setup lang="ts">
import { GenericImage, isVideoTarget, SmallArticleLinkFlavor } from 'perfapi';
import { computed, ref } from 'vue';

import LinkPartialPartner from '@/blocks/components/LinkBlock/LinkPartials/partner.vue';
import LinkPartialThumb from '@/blocks/components/LinkBlock/LinkPartials/thumb.vue';
import LinkPartialTitle from '@/blocks/components/LinkBlock/LinkPartials/title.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { useGtm } from '@/utils/gtm';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<
  LinkBlockProps & {
    meta?: string;
    mediaSize?: string;
    mediaAspect?: string;
    hasMarker?: boolean;
    thumbOptional?: boolean;
  }
>();

let image: GenericImage;
const linkFlavor = props.block.link?.linkFlavor as SmallArticleLinkFlavor | undefined;
if (linkFlavor?.image) {
  image = linkFlavor.image as GenericImage;
}

const imageUrl = computed(() => image?.url);

const showThumb = computed(() => (props.thumbOptional && !!imageUrl.value) || !props.thumbOptional);

const classList = computed(() => {
  const classes = ['link-block', 'link-block--thumb'];
  if (showThumb.value) classes.push('link-block--has-thumb');
  if (props.showReadState) classes.push('link-block--read-state');
  return classes;
});

const imageAlt = computed(() => image?.title || props.block.link?.title?.text || undefined);
const label = computed(() => linkFlavor?.label?.text);
const linkTarget = computed(() => props.block.link?.target);
const component = computed(() => (linkTarget.value ? AppTargetLink : 'span'));
const byline = computed(() => (!isVideoTarget(linkTarget.value) && linkFlavor?.byline?.text) || undefined);
const estimatedDuration = computed(() => linkFlavor?.estimatedDuration);
const brandImage = computed(() => linkFlavor?.brandIcon);
const linkEl = ref<Element | undefined>();

// Track when partner link is in view
if (props.isPartner) {
  const gtm = useGtm();

  useWhenInView({
    target: linkEl,
    callback: () =>
      gtm.add({
        event: 'smarticle-in-view',
        action: props.gtmLinkAttributes?.action,
        label: props.gtmLinkAttributes?.label,
      }),
  });
}
</script>

<style lang="postcss">
.link-block--has-thumb .title-wrapper {
  flex-wrap: wrap;

  .item-title__title-label-divider {
    display: none;
  }
}

.link-block--thumb {
  --thumbnail-max-width: 6.25rem;

  display: flex;
  width: 100%;
  padding: 0;

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
    align-self: center;
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

  .item-title {
    flex: auto;
    width: 100%;
  }

  .item-title__meta {
    margin-top: var(--grid-base);
    line-height: var(--line-height-meta);
  }

  &:visited {
    .item-marker {
      color: var(--color-link-one-visited);
    }
  }
}
</style>
