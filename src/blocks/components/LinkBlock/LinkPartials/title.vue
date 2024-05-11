<template>
  <div class="item-title" :class="blockModifiers">
    <span class="item-title__title" :title="title">
      <span v-if="label" class="item-title__title-label">
        {{ label }}
        <span class="item-title__title-label-divider" aria-hidden="true">|</span>
      </span>
      <span v-if="title" class="item-title__title-text">
        {{ title }}
      </span>
    </span>
    <span v-if="meta" class="item-title__meta">
      {{ meta }}
    </span>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    title: string;
    meta?: string;
    status?: string;
    labelInline?: boolean;
  }>(),
  {
    label: '',
    title: '',
    meta: '',
    status: 'old',
    labelInline: true,
  },
);

const blockModifiers = computed(() => ({
  'item-title--new': props.status === 'new',
  'item-title--has-label': props.label,
  'item-title--label-inline': props.label && props.labelInline === true,
}));
</script>

<style lang="postcss">
.item-title {
  line-height: 0;

  &__title {
    /* stylelint-disable-next-line */
    display: -webkit-box;
    overflow: hidden;
    line-height: 1.4em;
    text-overflow: ellipsis;
    word-break: break-word;
    /* stylelint-disable-next-line */
    -webkit-box-orient: vertical;
    /* stylelint-disable-next-line */
    -webkit-line-clamp: 3;

    &:empty {
      &::before,
      &::after {
        display: block;
        height: 1.1875rem;
        content: '';
        background-color: var(--color-bg--z2);
      }

      &::before {
        width: 90%;
        margin-bottom: var(--grid-base);
      }

      &::after {
        width: 70%;
      }
    }

    &-label {
      display: inline;
      color: var(--color-label-one);
    }
  }

  &--has-label {
    .item-title__title-label-divider {
      margin: 0 0.4rem 0 0.125rem;
      color: var(--color-body-text);
    }

    &:not(.item-title--label-inline, .item-title--n) {
      .item-title__title-label {
        display: block;
        margin-bottom: var(--grid-base);
        font-size: 90%;
        line-height: 1em;
      }

      .item-title__title-label-divider {
        display: none;

        @media screen and (min-width: 992px) {
          display: inline;
        }
      }
    }
  }

  &__meta {
    font-weight: 400;
  }
}
</style>
