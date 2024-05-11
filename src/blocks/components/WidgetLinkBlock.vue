<template>
  <div class="widget-link__item">
    <AppIcon v-if="image" description="test" :icon="image" class="widget-link__icon" />
    <span v-if="block.link?.title" class="widget-link__message">{{ block.link.title.text }}</span>
  </div>
</template>

<script setup lang="ts">
import { ImageLinkFlavor, WidgetLinkBlock } from 'perfapi';
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';

const props = defineProps<{ block: WidgetLinkBlock }>();

const imageLinkFlavor = props.block.link?.linkFlavor as ImageLinkFlavor;
const image = computed(() => imageLinkFlavor && imageLinkFlavor.image);
</script>

<style lang="postcss">
.widget-link {
  display: flex;
  flex-flow: row wrap;
  gap: var(--grid-base--x4);
  margin-bottom: var(--grid-base--x4);

  &__item {
    display: flex;
    flex: 1 0 8.5rem;
    flex-flow: column wrap;
    padding: var(--grid-base--x4) var(--grid-base--x2);
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--color-body-text);
    text-align: center;
    text-decoration: none;
    border: 1px solid var(--color-border--z0);
    border-radius: var(--border-radius);
  }

  &__icon {
    flex: 0 0 1.75rem;
    max-width: 3rem;
    margin-bottom: var(--grid-base--x4);
  }

  &__message {
    display: flex;
    flex: auto;
    flex-flow: column wrap;
    justify-content: center;
  }
}
</style>
