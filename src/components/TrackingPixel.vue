<!-- eslint-disable vuejs-accessibility/alt-text -->
<template>
  <img class="tracking-pixel" :src="urlWithCacheBusters" />
</template>

<script setup lang="ts">
import { TrackingPixelFlavor } from 'perfapi';
import { computed } from 'vue';

const props = defineProps<TrackingPixelFlavor>();

const urlWithCacheBusters = computed(() => {
  const random = (Math.random() + '').replace('0.', '');
  return props.url
    ?.replace(/\[timestamp]/i, Date.now().toString())
    .replace(/\[random]/i, random)
    .replace(/\[cachebuster]/i, random);
});
</script>

<style lang="postcss">
.tracking-pixel {
  position: fixed;
  top: 100%;
  left: 100%;
  visibility: hidden;
}
</style>
