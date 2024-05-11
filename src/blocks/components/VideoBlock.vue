<template>
  <div class="video-block" :class="classList" aria-label="video">
    <VideoMeta :caption="caption" :created-at="createdAt" :title="block.title" :nujij="nujij" />
    <VideoPlayer
      :media-id="block.mediaId"
      :preview-image="block.previewImage"
      :title="block.title"
      :duration="block.duration"
      :is-livestream="block.isLivestream"
      :video-player-flavor="block.videoPlayerFlavor"
      :is-inline="isInline"
    />
  </div>
</template>

<script setup lang="ts">
import { isArticleHeaderVideoFlavor, VideoBlock } from 'perfapi';
import { computed } from 'vue';

import VideoMeta from '@/components/Video/VideoMeta.vue';
import VideoPlayer from '@/components/Video/VideoPlayer.vue';
import { useNuJijStore } from '@/stores/nujij';
import { usePriorityLoading } from '@/utils/preloadClientSide';

const props = defineProps<{
  block: VideoBlock;
}>();

const nujijStore = useNuJijStore();
const nujij = computed(() => (!isInline.value ? { count: nujijStore.count, enabled: nujijStore.enabled } : undefined));

const caption = computed(() => props.block.videoFlavor?.caption);
const createdAt = computed(() => props.block.videoFlavor?.createdAt);
const isInline = computed(() => !props.block.videoFlavor);

const classList = computed(() => {
  let classList = [];
  if (isArticleHeaderVideoFlavor(props.block.videoFlavor)) {
    if (props.block.previewImage?.url) {
      usePriorityLoading(new URL(props.block.previewImage.url));
    }
    classList.push('video-block--hero');
  } else {
    classList.push('video-block--inline');
  }
  return classList;
});
</script>

<style lang="postcss">
.video-block {
  --column-area: stretched;

  display: flex;
  flex-flow: row wrap;

  &--hero {
    .video-player {
      flex: 0 1 100%;
    }

    .video-meta {
      display: initial;
      flex: 1;
      order: 1;
      margin: var(--block-spacing);
    }
  }

  &--inline {
    .video-player {
      flex: 1;
    }

    .video-meta {
      display: none;
    }
  }
}

@media (--two-columns-fit) {
  .video-block {
    &--hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 250px;
      column-gap: var(--grid-base--x4);

      .video-player {
        grid-row: 1;
        grid-column: 1;
      }

      .video-meta {
        grid-row: 1;
        grid-column: 2;
        margin: 0;
      }
    }
  }
}
</style>
