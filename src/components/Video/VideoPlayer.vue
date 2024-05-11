<template>
  <div class="video-player">
    <JWVideoPlayer
      v-if="isJWPlayerFlavor(videoPlayerFlavor)"
      :media-id="mediaId"
      :playlist="playlist"
      :is-livestream="isLivestream"
      :duration="duration"
      :disable-ads="disableAds"
      :ad-section-name="videoPlayerFlavor?.adSectionName"
      :preview-image-alt="previewImageAlt"
      :preview-image-url="previewImage && previewImage.url"
      :title="title"
      :is-inline="isInline"
      :is-vertical="isVertical"
    />
    <EmbedVideoPlayer
      v-else-if="isEmbedPlayerFlavor(videoPlayerFlavor) && embedCode"
      class="video-player__player"
      :title="title"
      :embed-code="embedCode"
      :preview-image="previewImage"
      :preview-image-alt="previewImageAlt"
      :formatted-duration="formattedDuration"
      :is-vertical="isVertical"
      :is-inline="isInline"
    />
    <YoutubeVideoPlayer
      v-else-if="isYouTubePlayerFlavor(videoPlayerFlavor) && youtubeUrl"
      class="video-player__player"
      :title="title"
      :embed-code="embedCode"
      :preview-image="previewImage"
      :preview-image-alt="previewImageAlt"
      :formatted-duration="formattedDuration"
      :is-vertical="isVertical"
      :is-inline="isInline"
      :url="youtubeUrl"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Image,
  isEmbedPlayerFlavor,
  isJWPlayerFlavor,
  isYouTubePlayerFlavor,
  StyledText,
  VideoPlayerFlavor,
} from 'perfapi';
import { computed, Ref, ref } from 'vue';

import { formatDuration } from '@/blocks/utils';
import EmbedVideoPlayer from '@/components/EmbedVideoPlayer.vue';
import JWVideoPlayer from '@/components/JWVideoPlayer.vue';
import YoutubeVideoPlayer from '@/components/YoutubeVideoPlayer.vue';

const props = withDefaults(
  defineProps<{
    mediaId?: string;
    previewImage?: Image;
    title?: StyledText;
    duration?: number;
    isLivestream: boolean;
    videoPlayerFlavor?: VideoPlayerFlavor;
    isInline: boolean;
  }>(),
  {
    mediaId: undefined,
    previewImage: undefined,
    title: undefined,
    duration: undefined,
    videoPlayerFlavor: undefined,
    isLivestream: false,
    isInline: false,
  },
);

const disableAds = computed(() => !!(isJWPlayerFlavor(props.videoPlayerFlavor) && props.videoPlayerFlavor.disableAds));

const previewImageAlt = ref(props.previewImage?.description || `Beeld uit video: ${props.title?.text || ''}`);
const playlist = ref<string | undefined>(undefined);
const isVertical = ref(false);
const formattedDuration = ref(formatDuration(props.duration));
// Conditional holders
const embedCode: Ref<string | undefined> = ref();
const youtubeUrl: Ref<string | undefined> = ref();

if (isJWPlayerFlavor(props.videoPlayerFlavor)) {
  playlist.value = props.videoPlayerFlavor.playlist || undefined;
} else if (isEmbedPlayerFlavor(props.videoPlayerFlavor) && props.videoPlayerFlavor.embedCode) {
  embedCode.value = props.videoPlayerFlavor.embedCode;
} else if (isYouTubePlayerFlavor(props.videoPlayerFlavor) && props.videoPlayerFlavor.url) {
  youtubeUrl.value = props.videoPlayerFlavor.url;
}
</script>
