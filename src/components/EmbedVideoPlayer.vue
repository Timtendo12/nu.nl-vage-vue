<template>
  <section class="embed-player" :class="classList">
    <img
      v-if="previewImage && previewImage.url"
      class="embed-player__preview-image"
      :src="previewImage && previewImage.url"
      :alt="previewImageAlt"
    />
    <VideoPreview
      v-if="showPreview"
      :title="title"
      :image-url="previewImage && previewImage.url"
      :image-alt="previewImageAlt"
      :duration="formattedDuration"
      :is-vertical="isVertical"
      :video-id="'embedded'"
      @click="hidePreview"
    />
    <!--eslint-disable-next-line vue/no-v-html-->
    <div v-else v-html="embedCode"></div>
  </section>
</template>

<script setup lang="ts">
import { Image, StyledText } from 'perfapi';
import { computed, ref } from 'vue';

import VideoPreview from '@/components/Video/VideoPreview.vue';

const props = defineProps<{
  embedCode: string;
  formattedDuration?: string;
  previewImage?: Image;
  previewImageAlt: string;
  title?: StyledText;
  isVertical: boolean;
  isInline: boolean;
}>();

const showPreview = ref(props.isInline);
const classList = computed(() => (props.isInline ? ['embed-player--inline'] : []));

const hidePreview = () => {
  showPreview.value = false;
};
</script>

<style lang="postcss">
.embed-player {
  position: relative;
  width: 100%;
  padding-bottom: var(--ratio-16-9);
  background-color: black;

  .video-preview {
    position: absolute;
  }

  &__preview-image,
  & iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

@media (--two-columns-fit) {
  .embed-player {
    &--inline {
      border-radius: var(--border-radius);

      iframe,
      .embed-player__preview-image {
        border-radius: var(--border-radius);
      }
    }
  }
}
</style>
