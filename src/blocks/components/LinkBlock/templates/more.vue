<template>
  <component
    :is="component"
    :target="linkTarget"
    class="link-block link-block--more states states--hover"
    :class="brandClass"
    :gtm-link-attributes="gtmLinkAttributes"
  >
    <link-partial-title :title="link.title?.text" />
    <app-icon embed class="item-marker">
      <icon-chevron-right />
    </app-icon>
  </component>
</template>

<script setup lang="ts">
import { MoreLinkFlavor, ScreenTarget } from 'perfapi';
import { computed } from 'vue';

import LinkPartialTitle from '@/blocks/components/LinkBlock/LinkPartials/title.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();

const link = computed(() => ({
  ...props.block.link,
  target: {
    ...props.block.link?.target,
  } as ScreenTarget,
}));

const linkTarget = computed(() => props.block.link?.target);
const component = computed(() => (linkTarget.value ? AppTargetLink : 'span'));

const brandClass = computed(() => {
  const theme = (props.block.link?.linkFlavor as MoreLinkFlavor)!.theme;
  return ['branded', `branded--${theme || 'nu'}`];
});
</script>

<style lang="postcss">
.link-block--more {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--brand-color);

  &:hover {
    color: var(--brand-color);
    text-decoration: underline;
  }
}
</style>
