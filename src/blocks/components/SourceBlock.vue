<template>
  <div v-if="block.title && block.icon" class="data-provider">
    <a class="data-provider__link" :href="url" target="_blank">
      <span class="data-provider__label">{{ block.title.text }}</span>
      <img :src="block.icon.url" :alt="block.title.text" class="data-provider__logo" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ScreenTarget, SourceBlock } from 'perfapi';
import { computed } from 'vue';

const props = defineProps<{
  block: SourceBlock;
}>();

const url = computed(() => (props.block.target as ScreenTarget).url || '');
</script>

<style lang="postcss">
.data-provider {
  &__link {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-grey-six);
    text-decoration: none;
  }

  &__logo {
    max-height: 2rem;
    margin-left: var(--grid-base--x2);
  }
}

/* TODO: Remove this once the actual dark-mode SVG's are available */
[data-theme='dark'] {
  .data-provider {
    &__logo {
      filter: brightness(0) invert(1);
    }
  }
}
</style>
