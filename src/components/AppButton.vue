<template>
  <button :class="classList" v-bind="attributes">
    <slot>Klik hier</slot>
  </button>
</template>

<script setup lang="ts">
import { GTMLinkAttributes } from 'perfapi';
import { computed } from 'vue';

import { createDataLinkAttributes } from '@/utils/gtm';

const props = withDefaults(
  defineProps<{
    buttonType?: string;
    colorway?: string;
    brand?: string;
    gtmButtonAttributes?: GTMLinkAttributes;
  }>(),
  {
    buttonType: undefined,
    colorway: undefined,
    brand: undefined,
    gtmButtonAttributes: undefined,
  },
);

const classList = computed(() => {
  const typeClassMap: Record<string, string> = {
    cta: 'app-button--cta',
    inversed: 'app-button--inversed',
    inline: 'app-button--inline',
  };

  const list = ['app-button'];
  if (props.buttonType) list.push(typeClassMap[props.buttonType]);
  if (props.brand !== undefined)
    props.brand === 'inherit' ? list.push('branded') : list.push(`branded branded--${props.brand}`);
  if (props.colorway !== undefined) list.push(`colorway colorway--${props.colorway}`);
  return list;
});

const attributes = props.gtmButtonAttributes && createDataLinkAttributes(props.gtmButtonAttributes);
</script>

<style lang="postcss">
.app-button {
  --color-button-bg-default-raw: var(--color-dark-blue-one-raw);
  --color-button-bg-default: hsl(var(--color-button-bg-default-raw));
  --color-button-bg-hover-default: hsl(var(--color-button-bg-default-raw) / 90%);
  --color-button-bg: var(--color-button-bg-default);
  --color-button-bg-hover: var(--color-button-bg-hover-default);
  --color-button-fg: var(--color-white-one);
  --color-button-fg-hover: var(--color-button-fg);
  --color-button-border: var(--color-button-bg);
  --color-button-border-hover: var(--color-button-border);
  --border-button-width: 1px;
  --border-button-width-hover: var(--border-button-width);

  display: inline-flex;
  gap: var(--grid-base--x2);
  align-items: center;
  padding: var(--grid-base--x2) var(--grid-base--x3);
  font-family: var(--primary-font-family);
  font-size: var(--font-size-button);
  font-weight: var(--font-weight-semi-bold);
  line-height: 1em;
  color: var(--color-button-fg);
  cursor: pointer;
  background-color: var(--color-button-bg);
  border-color: var(--color-button-border);
  border-style: solid;
  border-width: var(--border-button-width);
  border-radius: var(--border-radius);
  outline: 0;

  &:hover,
  &:focus,
  &:active {
    color: var(--color-button-fg-hover);
    background-color: var(--color-button-bg-hover);
    border-width: var(--border-button-width-hover);
  }

  &:disabled {
    cursor: default;
  }

  &.branded,
  &.colorway {
    --color-button-bg: var(--brand-color);
    --color-button-bg-hover: hsl(var(--brand-color-raw) / 90%);
    --color-button-fg: var(--brand-contrast-color);
  }

  /* Used for typical Button prototype behavior but plain link styling */
  &--inline {
    padding: 0;
  }

  &--cta,
  &--inline {
    --color-button-bg: transparent;
    --color-button-bg-hover: var(--color-button-bg);
    --color-button-fg: var(--color-button-bg-default);
    --color-button-fg-hover: var(--color-button-fg);
    --border-button-width: 0;

    &.branded,
    &.colorway {
      --color-button-bg: transparent;
      --color-button-bg-hover: var(--color-button-bg);
      --color-button-fg: var(--brand-color);
      --color-button-fg-hover: var(--color-button-fg);
      --border-button-width: 0;
    }

    &:disabled,
    &[disabled],
    &:disabled:hover,
    &[disabled]:hover {
      --state-color-bg: transparent;
      --color-button-bg: transparent;
      --color-button-fg: var(--color-grey-five);
    }
  }

  &--inversed {
    --color-button-bg: var(--color-bg--z0);
    --color-button-bg-hover: hsl(var(--color-button-bg-default-raw) / 10%);
    --color-button-fg: var(--color-button-bg-default);
    --color-button-border: var(--color-button-fg);

    &:disabled {
      --color-button-fg-hover: var(--color-grey-six);
      --color-button-bg-hover: var(--color-bg--z1);
    }

    &.branded,
    &.colorway {
      --color-button-bg: var(--color-bg--z0);
      --color-button-bg-hover: hsl(var(--brand-color-raw) / 10%);
      --color-button-fg: var(--brand-color);
      --color-button-border: var(--color-button-fg);
    }
  }

  &--nowrap {
    white-space: nowrap;
  }
}

[data-theme='dark'] {
  .app-button {
    --color-button-bg-default-raw: var(--color-body-base-raw);
  }
}
</style>
