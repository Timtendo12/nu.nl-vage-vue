<template>
  <li class="app-nav-item" :class="classNames">
    <a
      v-if="item.title"
      class="app-nav-item__link"
      :class="classList"
      :aria-label="item.title"
      :data-action="eventAction"
      :data-category="eventCategory"
      :data-label="item.title"
      :data-text="item.title"
      :data-type="eventAction"
      :href="item.url"
      :tabindex="preventTabIndexing ? -1 : 0"
      :title="item.title"
      >{{ item.title }}
    </a>
    <slot />
  </li>
</template>

<script setup lang="ts">
import { MenuItem, SubMenuItem } from 'perfapi';
import { computed, onMounted, ref } from 'vue';

import { PaddedMenuItem } from '@/utils/converters';

const activeItem = ref(false);

const props = defineProps<{
  item: MenuItem | SubMenuItem | PaddedMenuItem;
  eventAction: string;
  eventCategory: string;
  preventTabIndexing?: boolean;
}>();

const isPaddedMenuItem = (item: MenuItem | SubMenuItem | PaddedMenuItem): item is PaddedMenuItem =>
  (item as PaddedMenuItem).classNames !== undefined;

const classNames = computed(() => (isPaddedMenuItem(props.item) ? props.item.classNames : ''));

onMounted(() => {
  const currentPath = window.location.pathname;

  if (props.item.url === currentPath) {
    activeItem.value = true;
  }
});

const classList = computed(() => {
  const list = [];
  if (props.item.theme) list.push('branded branded--' + props.item.theme);
  activeItem.value ? list.push('app-nav-item__link--active') : null;
  return list;
});
</script>

<style lang="postcss">
.app-nav-item {
  --color-nav-item: var(--color-link-one);

  &__link {
    color: var(--color-nav-item);
    text-decoration: none;

    &.branded {
      --color-branded-nav-item: var(--brand-color);

      color: var(--color-branded-nav-item);
    }

    &--active {
      text-decoration: underline;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
