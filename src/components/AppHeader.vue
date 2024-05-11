<template>
  <component :is="props.level" class="header">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { HeaderLevel } from 'perfapi';

const props = withDefaults(
  defineProps<{
    level?: HeaderLevel;
  }>(),
  {
    level: HeaderLevel.H2,
  },
);
</script>

<style lang="postcss">
.header {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: calc(30 / 24);
  color: var(--brand-color);
  word-break: break-word;
}
</style>
