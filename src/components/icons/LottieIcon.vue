<script setup lang="ts">
import { LottieAnimation } from 'perfapi';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  animation: LottieAnimation;
  height?: string;
  width?: string;
}>();

const animationLink = ref('');

onMounted(() => {
  const raw = props.animation.src.split('?')[0];
  switch (window.location.hostname) {
    case 'localhost':
      animationLink.value = `${raw}?src=local`;
      break;
    case 'dev.nu.nl':
      animationLink.value = `${raw}?src=dev`;
      break;
    case 'test.nu.nl':
    case 'www.test.nu.nl':
      animationLink.value = `${raw}?src=test`;
      break;
    case 'staging.nu.nl':
    case 'www.staging.nu.nl':
      animationLink.value = `${raw}?src=staging`;
      break;
    default:
      animationLink.value = raw;
  }
});
</script>

<template>
  <Vue3Lottie
    v-if="animationLink"
    :autoplay="animation.autoplay ?? true"
    :animation-link="animationLink"
    :loop="animation.loop ?? true"
    :speed="animation.speed ?? 1"
    :height="height ?? '100%'"
    :width="width ?? '100%'"
    style="margin: 0"
  />
</template>
