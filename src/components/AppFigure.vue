<template>
  <figure :class="classList">
    <div class="app-figure__img" :style="style">
      <slot name="image"></slot>
    </div>
    <figcaption v-if="slots.caption" class="app-figure__caption">
      <slot name="caption"></slot>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

const slots = useSlots();

const props = defineProps<{
  overlay?: boolean;
  aspectRatio?: number;
}>();

const classList = computed(() => ['app-figure', props.overlay ? 'app-figure--caption-overlay' : null]);

const style = computed(() => ({
  'padding-bottom': (props.aspectRatio ? 100 / props.aspectRatio : 114.535666218035) + '% !important',
}));
</script>

<style lang="postcss">
.app-figure {
  position: relative;
  margin: 0;
  border: none;

  &__img {
    position: relative;

    > img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      max-height: 100%;
      overflow: hidden;
      background-color: var(--color-skeleton);
    }
  }

  &__caption {
    display: flex;
    flex-wrap: wrap;
    gap: var(--grid-base);
    padding: var(--grid-base--x2) var(--grid-base--x4) 0;
    font-weight: 700;
    line-height: normal;
  }

  &--caption-overlay {
    background: linear-gradient(0deg, rgb(85 85 85), white 35%);

    .app-figure {
      &__img {
        mix-blend-mode: multiply;
      }

      &__caption {
        position: absolute;
        bottom: 0;
        display: flex;
        flex-flow: column wrap;
        width: 100%;
        padding-right: var(--grid-base--x4);
        padding-bottom: var(--grid-base--x4);
        padding-left: var(--grid-base--x4);
        text-shadow: 0 2px 8px rgba(0 0 0 / 60%);
      }
    }
  }
}

@media (--two-columns-fit) {
  .app-figure {
    border-radius: var(--border-radius);

    &__img {
      > img {
        border-radius: var(--border-radius);
      }
    }

    &__caption {
      padding: var(--grid-base--x4) 0 0;
    }

    &--caption-overlay {
      .app-figure {
        &__caption {
          padding-right: var(--grid-base--x6);
          padding-bottom: var(--grid-base--x6);
          padding-left: var(--grid-base--x6);
        }
      }
    }
  }
}

[data-theme='dark'] {
  .app-figure {
    &--has-placeholder {
      background-color: var(--color-darkgrey-one);
    }
  }
}
</style>
