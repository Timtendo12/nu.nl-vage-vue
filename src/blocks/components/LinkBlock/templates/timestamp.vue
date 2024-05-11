<template>
  <app-target-link v-if="linkTarget" :target="linkTarget" :class="classList" :gtm-link-attributes="gtmLinkAttributes">
    <link-partial-datetime :datetime-formatted="datetimeFormatted" />
    <link-partial-title :title="props.block.link?.title?.text" :label="label" />
    <app-icon embed class="item-marker">
      <icon-chevron-right />
    </app-icon>
  </app-target-link>
</template>

<script setup lang="ts">
import { SmallArticleLinkFlavor } from 'perfapi';
import { computed } from 'vue';

import LinkPartialDatetime from '@/blocks/components/LinkBlock/LinkPartials/datetime.vue';
import LinkPartialTitle from '@/blocks/components/LinkBlock/LinkPartials/title.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';
import { formatToCETTime } from '@/utils/date';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();
const linkFlavor = props.block.link?.linkFlavor as SmallArticleLinkFlavor | undefined;

const linkTarget = computed(() => props.block.link?.target);
const label = computed(() => linkFlavor?.label?.text);

const datetimeFormatted = computed(() =>
  linkFlavor?.publishedAt ? formatToCETTime(new Date(linkFlavor?.publishedAt)) : '',
);

const classList = computed(() => [
  'link-block',
  'link-block--timestamp',
  props.showReadState ? 'link-block--read-state' : null,
]);
</script>

<style lang="postcss">
.link-block--timestamp {
  display: flex;
  align-items: center;
  width: 100%;
  height: 3rem;

  .item-datetime {
    flex: 0 0 3.125rem;
    font-size: calc(var(--font-size-contentlist--s0) - 0.1rem);
    line-height: calc(var(--line-height-contentlist--s0) - 0.1rem);
    color: var(--color-caption-one);
  }

  .item-title {
    flex: 1 1 auto;
    align-self: center;
    margin-left: var(--grid-base--x2);

    &__title {
      -webkit-line-clamp: 2;
    }
  }

  .item-marker {
    flex: 0 0 0.625rem;
    width: 1.0625rem;
    aspect-ratio: 1/1;
    margin-left: var(--grid-base--x2);
  }

  &:hover,
  &:focus {
    .item-title {
      text-decoration: underline;
    }
  }
}
</style>
