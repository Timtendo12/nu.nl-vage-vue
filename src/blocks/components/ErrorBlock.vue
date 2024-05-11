<template>
  <slot>
    <p>{{ message }}</p>
  </slot>
</template>

<script setup lang="ts">
import { ErrorBlock } from 'perfapi';
import { computed } from 'vue';

import { getEnvVariable } from '@/utils/config';

const isProd = getEnvVariable('VITE_ENVIRONMENT', '') === 'production';
const props = defineProps<{
  block?: ErrorBlock;
}>();

const message = computed(() => (isProd ? 'Er is een fout opgetreden.' : props.block?.message));
</script>
