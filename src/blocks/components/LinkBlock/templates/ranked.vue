<template>
  <app-target-link v-if="linkTarget" :target="linkTarget" :class="classList" :gtm-link-attributes="gtmLinkAttributes">
    <AtomCounter :count="props.index! + 1" />
    <link-partial-title :title="title" :label="label" />
    <app-icon embed class="item-marker">
      <icon-chevron-right />
    </app-icon>
  </app-target-link>
</template>

<script setup lang="ts">
import { SmallArticleLinkFlavor } from 'perfapi';
import { computed } from 'vue';

import AtomCounter from '@/blocks/components/LinkBlock/LinkPartials/counter.vue';
import LinkPartialTitle from '@/blocks/components/LinkBlock/LinkPartials/title.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();
const linkFlavor = props.block.link?.linkFlavor as SmallArticleLinkFlavor | undefined;
const linkTarget = computed(() => props.block.link?.target);
const title = computed(() => props.block.link?.title?.text);
const label = computed(() => linkFlavor?.label?.text);

const classList = computed(() => {
  const classes = ['link-block', 'link-block--rank'];
  if (props.showReadState) classes.push('link-block--read-state');
  return classes;
});
</script>

<style lang="postcss">
.link-block--rank {
  display: flex;
  align-items: center;
  width: 100%;
  height: 3rem;

  .item-counter {
    flex: 0 0 3.125rem;
    font-weight: bold;
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
