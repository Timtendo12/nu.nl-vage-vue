<template>
  <app-target-link
    v-if="linkTarget"
    :target="linkTarget"
    class="all-comments-button"
    :gtm-link-attributes="gtmLinkAttributes"
    ><AppIcon embed embed-alt="Bekijk meer reacties" class="all-comments-button__icon" width="15" height="15">
      <IconComment /> </AppIcon
    >{{ block.link?.title?.text }}</app-target-link
  >
</template>

<script setup lang="ts">
import { GTMLinkAttributes } from 'perfapi';
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import IconComment from '@/components/icons/IconComment.vue';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();

const gtmLinkAttributes = computed<GTMLinkAttributes>(
  () =>
    props.gtmLinkAttributes || {
      __typename: 'GTMLinkAttributes',
      category: 'nujij',
      action: 'go-to-reactions',
      label: 'via-highlighted-comments',
    },
);

const linkTarget = computed(() => props.block.link?.target);
</script>

<style lang="postcss">
.all-comments-button {
  display: inline-flex;
  align-items: center;
  padding: var(--grid-base--x2) var(--grid-base--x4);
  margin: var(--grid-base--x4) 0;
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-button);
  color: var(--color-button-three);
  background-color: var(--color-button-bg-three);
  border-color: var(--color-button-bg);
  border-radius: var(--border-radius);

  &:hover {
    color: var(--color-button-three);
    background-color: var(--color-green-four);
  }

  &__icon {
    width: 0.875rem;
    aspect-ratio: 1/1;
    margin-right: var(--grid-base--x2);
    vertical-align: top;
  }
}
</style>
