<template>
  <section class="youtube-player" :class="classList">
    <VideoPreview
      v-if="showPreview"
      :title="title"
      :image-url="imageUrl"
      :image-alt="previewImageAlt"
      :duration="formattedDuration"
      :is-vertical="isVertical"
      :video-id="videoId"
      @click="hidePreview"
    />
    <iframe
      v-else
      id="ytplayer"
      title="Video player"
      type="text/html"
      :src="`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1`"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </section>
</template>

<script setup lang="ts">
import { Image, StyledText } from 'perfapi';
import { computed, ref } from 'vue';

import VideoPreview from '@/components/Video/VideoPreview.vue';

const props = defineProps<{
  url: string;
  formattedDuration?: string;
  previewImage?: Image;
  previewImageAlt: string;
  title?: StyledText;
  isVertical: boolean;
  isInline: boolean;
}>();

const videoId = computed(() => {
  if (props.url.includes('watch')) {
    const queryString = props.url.split('?')[1];
    const entries = Object.fromEntries(new URLSearchParams(queryString).entries());
    return entries.v;
  } else if (props.url.length < 'www.youtube.com'.length) {
    return props.url;
  } else {
    const path = props.url.split('?')[0].split('/');
    return path[path.length - 1];
  }
});

const imageUrl = ref<string | undefined>(props.previewImage?.url);
if (!imageUrl.value && videoId.value) {
  imageUrl.value = `https://i.ytimg.com/vi/${videoId.value}/maxresdefault.jpg`;
}

const showPreview = ref(props.isInline);
const classList = computed(() => (props.isInline ? ['youtube-player--inline'] : []));

const hidePreview = () => {
  showPreview.value = false;
};
</script>

<style lang="postcss">
.youtube-player {
  position: relative;
  width: 100%;
  padding-bottom: var(--ratio-16-9);
  background-color: black;

  .video-preview {
    position: absolute;
  }

  & iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  &--inline {
    border-radius: var(--border-radius);

    iframe {
      border-radius: var(--border-radius);
    }
  }
}
</style>
