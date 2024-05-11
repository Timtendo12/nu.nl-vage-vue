<template>
  <figure
    ref="rootComponent"
    :class="classList"
    class="video-preview"
    role="button"
    aria-roledescription="video afspelen"
  >
    <div class="video-preview__wrapper">
      <AppImage v-if="imageUrl" class="video-preview__image" :url="imageUrl" :alt="imageAlt" />
      <span v-if="duration" class="video-preview__duration" :aria-label="screenReaderDuration">
        {{ duration }}
      </span>
      <figcaption v-if="title" class="video-preview__caption">
        <AppIcon embed embed-alt="Afspelen knop" width="56" height="56" class="video-preview__icon">
          <IconPlay />
        </AppIcon>

        <h2 class="video-preview__title" :aria-label="'titel: ' + title.text">{{ title.text }}</h2>
      </figcaption>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { StyledText } from 'perfapi';
import { computed, ref } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import AppImage from '@/components/AppImage.vue';
import IconPlay from '@/components/icons/IconPlay.vue';
import { useWhenPartlyInView } from '@/composables/in-view/use-when-in-view';
import { useGtm } from '@/utils/gtm';

const props = defineProps<{
  title?: StyledText;
  imageUrl?: string;
  imageAlt?: string;
  duration?: string;
  isVertical?: boolean;
  videoId?: string;
}>();

const rootComponent = ref<Element>();

const classList = computed(() => {
  let classList = [];
  if (props.isVertical) {
    classList.push('video-preview--vertical');
  } else {
    classList.push('video-preview--horizontal');
  }
  return classList;
});

const gtm = useGtm();

const screenReaderDuration = computed(() => {
  if (!props.duration) return;
  const [minutes, seconds] = props.duration.split(':');
  return `video looptijd: ${minutes} minuten en ${seconds} seconden`;
});

useWhenPartlyInView({
  target: rootComponent,
  threshold: 0.5,
  callback: () =>
    gtm.add({
      event: 'article-video-in-view',
      'video-id': props.videoId,
    }),
});
</script>

<style lang="postcss" scoped>
.video-preview {
  --video-preview-icon-size: 2rem;
  --video-preview-default-offset: var(--grid-base--x4);
  --video-preview-title-font-size: 0.875rem;
  --video-preview-title-line-height: calc(18 / 14);
  --video-preview-duration-font-size: 0.8125rem;
  --video-preview-duration-line-height: calc(15 / 13);
  --video-preview-caption-offset: var(--video-preview-default-offset);
  --video-preview-caption-offset-top: var(--grid-base--x11);
  --video-preview-caption-offset-bottom: var(--video-preview-default-offset);
  --video-preview-border-radius: 0;

  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  overflow: hidden;
  cursor: pointer;
  background-color: var(--color-skeleton);
  border-radius: var(--video-preview-border-radius);

  &__wrapper {
    position: relative;
    overflow: hidden;
    background-color: var(--color-skeleton);
    border-radius: var(--video-preview-border-radius);
  }

  &--vertical {
    max-width: 400px;

    .video-preview__wrapper {
      padding-bottom: var(--ratio-9-16);
    }
  }

  &--horizontal {
    .video-preview__wrapper {
      width: 100%;
      padding-bottom: var(--ratio-16-9);
    }
  }

  &__image {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translateX(-50%) translateY(-50%);
  }

  &__caption {
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--video-preview-caption-offset-top) var(--video-preview-caption-offset)
      var(--video-preview-caption-offset-bottom) var(--video-preview-caption-offset);
    margin: 0;
    background: linear-gradient(180deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0 / 30%) 97.43%);
  }

  &__icon {
    width: var(--video-preview-icon-size);
    height: var(--video-preview-icon-size);
    color: var(--color-white-one);
  }

  &__title {
    /* stylelint-disable-next-line */
    display: -webkit-box;
    padding: var(--grid-base) 0 var(--grid-base) var(--video-preview-default-offset);
    margin:
      0 0 calc(-1 * var(--grid-base--x4)),
      0;
    overflow: hidden;
    font-size: var(--video-preview-title-font-size);
    line-height: var(--video-preview-title-line-height);
    color: var(--color-white-one);
    text-overflow: ellipsis;
    text-shadow: 0 1px 3px rgb(0 0 0 / 60%);
    word-break: break-word;
    /* stylelint-disable-next-line */
    -webkit-line-clamp: 3;
    /* stylelint-disable-next-line */
    -webkit-box-orient: vertical;
  }

  &__duration {
    position: absolute;
    top: var(--video-preview-default-offset);
    right: var(--video-preview-default-offset);
    padding: var(--grid-base);
    margin: 0;
    font-size: var(--video-preview-duration-font-size);
    line-height: var(--video-preview-duration-line-height);
    color: var(--color-white-one);
    background: rgb(0 0 0 / 25%);
    border-radius: var(--border-radius--half);
  }
}

.video-block--breakout {
  .video-preview {
    --video-preview-border-radius: 0;
  }
}

@media (--two-columns-fit) {
  .video-preview {
    --video-preview-border-radius: var(--border-radius);
  }
}

@media (--c1-cols-min580) {
  .video-preview {
    /* stylelint-disable-next-line custom-property-pattern */
    --video-preview-icon-size: 3.5rem;
    --video-preview-default-offset: var(--grid-base--x8);
    --video-preview-title-font-size: 1.375rem;
    --video-preview-title-line-height: calc(28 / 22);
    --video-preview-caption-offset-top: var(--grid-base--x22);
  }
}

@media (--c2-main-col-min580) {
  .col-main {
    .video-preview {
      /* stylelint-disable-next-line custom-property-pattern */
      --video-preview-icon-size: 3.5rem;
      --video-preview-default-offset: var(--grid-base--x8);
      --video-preview-title-font-size: 1.375rem;
      --video-preview-title-line-height: calc(28 / 22);
      --video-preview-caption-offset-top: var(--grid-base--x22);
    }
  }
}

[data-theme='dark'] {
  .video-preview {
    &__wrapper {
      background-color: var(--color-darkgrey-one);
    }
  }
}
</style>
