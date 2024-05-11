<template>
  <li class="app-nav-item">
    <AppTargetLink class="app-nav-item__link" :target="target">Privacy instellingen</AppTargetLink>
    <slot />
  </li>
</template>
<script setup lang="ts">
import { UrlTarget } from 'perfapi';

import AppTargetLink from '@/components/AppTargetLink.vue';
import { getEnvVariable } from '@/utils/config';

const consentUrl = new URL('?modal=cookie-instellingen', `https://${getEnvVariable('VITE_NUNL_URL')}`);
const target = {
  url: consentUrl.href,
  __typename: 'UrlTarget',
} as UrlTarget;
</script>
<style lang="postcss">
.app-nav-item {
  --color-nav-item: var(--color-link-one);

  &__link {
    color: var(--color-nav-item);
    text-decoration: none;
  }
}
</style>
