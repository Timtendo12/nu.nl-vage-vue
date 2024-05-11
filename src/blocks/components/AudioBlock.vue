<template>
  <div class="audio-block">
    <iframe title="Audio block" class="audio-block__embed" :src="embedUrl" scrolling="no" />
  </div>
</template>

<script setup lang="ts">
import { AudioBlock } from 'perfapi';
import { computed } from 'vue';

const props = defineProps<{
  block: AudioBlock;
}>();

const embedUrl = computed(() => {
  const url = props.block.embedUrl?.replace(/\/$/, '');
  return url && url.slice(-5) === 'embed' ? url : url + '/embed';
});
</script>

<style lang="postcss">
.audio-block {
  display: flex;
  align-items: stretch;
  height: 200px;

  &__embed {
    flex: 0 0 100%;
    border: 0;
  }
}
</style>
