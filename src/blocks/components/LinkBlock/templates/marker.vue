<template>
  <app-target-link
    v-if="linkTarget"
    :target="linkTarget"
    class="link-block marker-link-block"
    :gtm-link-attributes="gtmLinkAttributes"
  >
    {{ props.block.link?.title?.text
    }}<app-icon embed class="item-marker marker-link-block__item-marker">
      <icon-chevron-right />
    </app-icon>
  </app-target-link>
</template>

<script setup lang="ts">
import { GTMLinkAttributes, UrlTarget } from 'perfapi';
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import IconChevronRight from '@/components/icons/IconChevronRight.vue';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();

const gtmLinkAttributes = computed<GTMLinkAttributes>(
  () =>
    props.gtmLinkAttributes || {
      __typename: 'GTMLinkAttributes',
      category: 'article',
      action: 'tag-click',
      label: (props.block.link?.target as UrlTarget)?.url,
    },
);
const linkTarget = computed(() => props.block.link?.target);
</script>

<style lang="postcss">
.marker-link-block {
  display: block;
  font-size: var(--font-size-body--s0);
  line-height: var(--line-height-body--s0);

  &:hover {
    text-decoration: underline;
  }

  &__item-marker {
    flex: 0 0 0.625rem;
    width: 1.0625rem;
    aspect-ratio: 1/1;
    vertical-align: middle;
  }
}
</style>
