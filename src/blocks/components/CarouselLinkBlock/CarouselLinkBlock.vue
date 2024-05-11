<template>
  <div v-if="slideShowImages && slideShowImages.length > 0" class="slideshow slideshow--breakout">
    <div ref="royalSLider" style="width: 100%" class="royalSlider rsDefault rsNunl">
      <a
        v-for="link in slideShowImages"
        :key="link.title?.text"
        class="rsImg"
        :href="link.linkFlavor?.image?.url"
        :data-rsBigImg="link.linkFlavor?.image?.url"
      >
        <div class="rsCaption">
          <span v-if="link.linkFlavor?.image.description">
            {{ link.linkFlavor.image.description }}
          </span>
          <span v-if="link.linkFlavor?.image.copyright" class="rsCopyright"
            >&copy; {{ link.linkFlavor?.image.copyright }}
          </span>
        </div>
      </a>
    </div>
    <div ref="rsActionBar" style="display: none">
      <div class="rsActionBar left">
        <div class="rsActionBarBtn rsSlideCount"></div>
      </div>
      <div class="rsActionBar right">
        <div class="rsActionBarBtn rsImageOnlyBtn">
          <AppIcon embed embed-alt="Toon alleen het Plaatje" width="20" height="20" class="iconEyeOpen">
            <IconEyeOpen />
          </AppIcon>
          <AppIcon embed embed-alt="Toon alleen het Plaatje" width="20" height="20" class="iconEyeClosed">
            <IconEyeClosed />
          </AppIcon>
        </div>
      </div>
      <div class="rsActionBar center">
        <div class="rsSlideshowTitle">
          <span>{{ block.legacySlideshowName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CarouselLinkBlock, GenericImage, ImageLinkFlavor, isImageLinkFlavor, Link } from 'perfapi';
import { computed, inject, ref } from 'vue';
import { useHybridScripts } from 'vue3-hybrid-scripts';

import AppIcon from '@/components/AppIcon.vue';
import IconEyeClosed from '@/components/icons/IconEyeClosed.vue';
import IconEyeOpen from '@/components/icons/IconEyeOpen.vue';
import { useWhenPartlyInView } from '@/composables/in-view/use-when-in-view';
import { useGtm } from '@/utils/gtm';

import {
  initializeRoyalSlider,
  setCloseFullScreenAttribute,
  setFlipperAttribute,
  setFullScreenAttribute,
} from './royalSlider';

const props = defineProps<{
  block: CarouselLinkBlock;
}>();

const rsActionBar = ref<Element | null>(null);
const royalSLider = ref<Element | undefined>();
const gtmLocation: string | undefined = inject('gtmLocation');
type GTMCouples = [string, string][];

useHybridScripts(
  [
    '/assets/royalSlider/css/royalslider.css',
    '/assets/royalSlider/skins/default/rs-default.css',
    'https://code.jquery.com/jquery-3.5.1.min.js',
    '/assets/royalSlider/js/jquery.royalslider.min.js',
  ],
  () => {
    if (royalSLider.value && royalSLider.value?.children?.length > 0) {
      const slider = initializeRoyalSlider(royalSLider.value as Element, rsActionBar.value as Element);

      (
        [
          ['data-category', 'slideshow'],
          ['data-action', 'flip'],
          ['data-label', gtmLocation],
        ] as GTMCouples
      ).forEach(([key, value]) => setFlipperAttribute(slider, key, value));

      (
        [
          ['data-category', 'slideshow'],
          ['data-action', 'full-screen'],
          ['data-label', gtmLocation],
        ] as GTMCouples
      ).forEach(([key, value]) => setFullScreenAttribute(slider, key, value));

      (
        [
          ['data-category', 'slideshow'],
          ['data-action', 'close-full-screen'],
          ['data-label', gtmLocation],
        ] as GTMCouples
      ).forEach(([key, value]) => setCloseFullScreenAttribute(slider, key, value));
    }
  },
);

const slideShowImages = computed(() =>
  props.block.links
    ?.filter((l: Link) => isImageLinkFlavor(l.linkFlavor))
    .map((l: Link) => {
      const linkFlavor = l.linkFlavor as ImageLinkFlavor;
      const image = linkFlavor.image as GenericImage;
      return {
        ...l,
        linkFlavor: {
          ...linkFlavor,
          image,
        },
      };
    }),
);

const gtm = useGtm();

useWhenPartlyInView({
  target: royalSLider,
  threshold: 0.5,
  callback: () =>
    gtm.add({
      event: 'slideshow-in-view',
      'slideshow-location': gtmLocation,
    }),
});
</script>

<style lang="postcss">
/* stylelint-disable selector-class-pattern */
:root {
  --royalslider-copyright-color: white;
  --font-size-normal: 16px;
}

.slideshow {
  --column-area: stretched;

  position: relative;
  aspect-ratio: 16/9;

  .royalSlider {
    overflow: hidden;

    .rsGCaption {
      display: none;
      padding: 5px 10px 10px 8px;
      font-size: var(--font-size-normal);

      .rsCopyright {
        padding-left: 0.625rem;
        color: var(--royalslider-copyright-color);
      }
    }
  }

  .rsNav {
    display: none;
  }

  .rsSlideshowTitle {
    display: none;
  }

  /* Action bar */
  .rsActionBar {
    position: absolute;
    top: 0;
    z-index: 20;
    display: none;
    margin-top: 6px;

    &.left {
      left: 7px;
      display: block;
    }

    &.right {
      right: 0;
      margin-right: 38px; /* leave space of the right for fullscreen button */
    }

    &.center {
      z-index: 15;
      width: 100%;
      height: 41px;
      margin-top: 0;
      text-align: center;
      background-color: rgba(0 0 0 75%);
      background-color: black;

      > .rsSlideshowTitle {
        position: relative;
        max-width: 70%;
        padding-top: 12px;
        margin-left: -66px;
        color: white;

        > span {
          display: inline-block;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .rsActionBarBtn {
    z-index: 22;
    display: inline-block;
    min-width: 32px;
    height: 32px;
    padding: 6px;
    margin-right: 5px;
    color: white;
    cursor: pointer;
    background-color: black;
    background-color: rgba(0 0 0 75%);
    border-radius: 2px;

    .icon-share {
      display: none;
    }
  }

  .rsFullscreen .rsActionBar {
    display: block;
  }

  .rsShareOverlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 25;
    display: none;
    width: 100%;
    height: 100%;
    background: rgba(0 0 0 75%);

    .slideshow-sharing {
      display: table;
      width: 100%;
      height: 100%;

      .block-wrapper {
        display: table-cell;
        width: 100%;
        height: 100%;
        text-align: center;
        vertical-align: middle;

        .block-title {
          background: transparent !important;

          h2 {
            color: white;
          }
        }
      }
    }
  }

  .overlayActive {
    .rsFullscreenBtn,
    .rsActionBarBtn,
    .rsArrow,
    .rsSlideCount {
      display: none;
    }

    .rsShareOverlay {
      display: block;

      .rsActionBar {
        margin-right: 6px;
      }

      .rsActionBar,
      .rsActionBarBtn {
        display: block;
      }
    }

    &.slideshowIsFullscreen {
      .rsShareOverlay {
        position: fixed;
        z-index: 2000000001;
      }
    }
  }

  .rsActionBarBtn.rsImageOnlyBtn {
    display: flex;
    align-items: center;
    justify-content: center;

    .iconEyeOpen {
      display: block;
    }

    .iconEyeClosed {
      display: none;
    }
  }

  .rsActionBarBtn.rsImageOnlyBtn.closed {
    .iconEyeOpen {
      display: none;
    }

    .iconEyeClosed {
      display: block;
    }
  }

  .rsNunl {
    width: 100%;

    &.rsFullscreen .rsGCaption {
      left: 0;
      display: block;
      width: 100%;
      text-align: center;
    }

    &.rsFullscreen .rsNav {
      display: block;
    }

    &.rsFullscreen.rsImageOnly {
      .rsNav {
        display: none;
        height: 0;
      }

      .rsGCaption,
      .rsActionBarBtn,
      .rsSlideshowTitle,
      .rsArrow,
      .rsSlideCount {
        display: none;
      }

      .rsActionBar.center {
        background-color: transparent;
      }

      .rsActionBarBtn.rsImageOnlyBtn {
        display: flex;
      }
    }
  }
}

@media (--two-columns-fit) {
  .slideshow {
    .royalSlider {
      border-radius: var(--border-radius);
    }

    .rsSlideshowTitle {
      display: inline-block;
    }
  }
}
</style>
