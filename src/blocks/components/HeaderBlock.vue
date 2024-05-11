<template>
  <header :id="blockId" ref="header" :class="classList" :data-slug="titleAsSlug">
    <AppHeader :level="headerLevel" class="header-block__header">
      <AppTargetLink
        v-if="block.target"
        class="header-block__link"
        :target="block.target"
        :gtm-link-attributes="gtmLinkAttributes"
      >
        {{ block.title?.text }}
      </AppTargetLink>
      <template v-else-if="block.title">
        <AppIcon v-if="icon" embed embed-alt="" width="24px" height="24px" class="header-block__icon">
          <component :is="icon" />
        </AppIcon>
        {{ block.title.text }}
      </template>
      <slot v-else></slot>
    </AppHeader>
    <p v-if="block.subtitle" class="header-block__subtitle">{{ block.subtitle.text }}</p>
  </header>
</template>

<script setup lang="ts">
import { decode64String } from '@server/utils/tokenUtils';
import { GTMLinkAttributes, HeaderBlock, HeaderLevel, isGraphic, UrlTarget } from 'perfapi';
import { computed, Ref, ref } from 'vue';

import AppHeader from '@/components/AppHeader.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import { mapPerfApiIcon } from '@/components/icons';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { NuVoorJouDataLayerEvent, useGtm } from '@/utils/gtm';

const header = ref<Element | undefined>();

const gtm = useGtm();

const props = defineProps<{
  block: HeaderBlock;
}>();

const makeSlugOfTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace('&', 'en')
    .replace(/[^a-z0-9-_]/g, '');

const titleAsSlug = computed(() => (props.block.title?.text ? makeSlugOfTitle(props.block.title.text) : ''));

let containerId = '';
try {
  const idObject = JSON.parse(decode64String(props.block.id));
  containerId = idObject.containerId;
} catch {}

// for now only `nuvoorjou` gets a header id attribute
const blockId = computed(() => (containerId === 'nuvoorjou' ? containerId : undefined));

const prefixIcon = computed(() => {
  if (props.block?.titlePrefixIcon) {
    return isGraphic(props.block?.titlePrefixIcon) ? props.block?.titlePrefixIcon.name : null;
  } else {
    return null;
  }
});

const headerLevel = computed(() => props.block.headerLevel || HeaderLevel.H2);

const GTMNuVoorJouEvents: Ref<NuVoorJouDataLayerEvent> = computed(() => {
  if (props.block.groupIds?.includes('nuvoorjou')) {
    return {
      action: 'show_nuvoorjou',
      category: 'list-block',
      label: 'nuvoorjou',
      event: 'nuvoorjou-in-view',
    };
  }
  if (props.block.groupIds?.includes('nuvoorjou_anonymous')) {
    return {
      action: 'show_nuvoorjou',
      category: 'list-block',
      label: 'nuvoorjou_anonymous',
      event: 'nuvoorjou-in-view',
    };
  }
  if (props.block.groupIds?.includes('nuvoorjou_noconsent')) {
    return {
      action: 'show_nuvoorjou',
      category: 'list-block',
      label: 'nuvoorjou_noconsent',
      event: 'nuvoorjou-in-view',
    };
  }
  return {
    action: `show_${props.block.title?.text}`,
    category: 'list-block',
    label: props.block.title?.text,
  };
});

const gtmLinkAttributes: Ref<GTMLinkAttributes> = computed(() => ({
  __typename: 'GTMLinkAttributes',
  category: 'list-block',
  label: (props.block.target as UrlTarget)?.url,
  action: `click-header_${props.block.title?.text}`,
}));

const classList = computed(() => ['header-block', 'branded', `branded--${props.block.theme || 'nu'}`]);

const icon = computed(() => mapPerfApiIcon(prefixIcon.value));

useWhenInView({ target: header, callback: () => gtm.add(GTMNuVoorJouEvents.value) });
</script>

<style lang="postcss">
.header-block {
  &__header {
    display: flex;
    gap: var(--grid-base--x2);
    margin: 0;
  }

  &__link {
    &:hover {
      text-decoration: underline;
    }
  }

  &__icon {
    align-items: flex-start;
    align-self: flex-start;
    margin-top: 2px;
  }

  &__subtitle {
    margin-top: var(--grid-base--x2);
    margin-bottom: 0;
  }
}
</style>
