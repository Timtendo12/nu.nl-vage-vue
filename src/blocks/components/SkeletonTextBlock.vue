<template>
  <div class="skeleton-text-block" :class="modifiers">
    <div v-for="index in block.rows" :key="index" class="skeleton-text-block__row"></div>
  </div>
</template>

<script setup lang="ts">
import { Block } from 'perfapi';
import { computed } from 'vue';

enum SkeletonModifier {
  'small',
  'half',
}

interface SkeletonTextBlock extends Block {
  __typename: 'SkeletonTextBlock';
  rows: number;
  modifiers?: SkeletonModifier[];
}

const modifiers = computed(() => props.block.modifiers?.map((m) => `skeleton-text-block--${m}`));
const props = defineProps<{
  block: SkeletonTextBlock;
}>();
</script>

<style lang="postcss">
.skeleton-text-block {
  --line-color: var(--color-skeleton);
  --shine-color: var(--color-grey-two);
  --font-size: var(--font-size-body--s1);
  --line-height: var(--line-height-body--s1);

  margin: 0;

  &--small {
    --font-size: var(--font-size-body--s0);
    --line-height: var(--line-height-body--s0);
  }

  &--half {
    width: 50%;
  }

  &__row {
    height: var(--font-size);
    margin-bottom: calc(var(--line-height) - var(--font-size));
    overflow: hidden;
    background-color: var(--line-color);

    &:last-child {
      margin-right: 3.125rem;
    }

    &::before {
      display: block;
      width: 100%;
      height: 100%;
      content: '';
      background-image: linear-gradient(90deg, var(--line-color) 0, var(--shine-color) 40px, var(--line-color) 80px);
      transform: translateX(-80px);
      animation-name: shine;
      animation-duration: 2s;
      animation-iteration-count: infinite;
    }
  }
}

@keyframes shine {
  0% {
    transform: translateX(-80px);
  }

  100% {
    transform: translateX(2000px);
  }
}
</style>
