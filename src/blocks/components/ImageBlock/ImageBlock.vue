<template>
  <AppTargetLink
    v-if="target && url"
    class="image-block-link"
    :class="stretchedImageModifier"
    :target="target"
    :gtm-link-attributes="linkAttributes"
  >
    <div ref="linkImage">
      <ImageBlock :block="nestedBlock" :nested="true" />
    </div>
  </AppTargetLink>

  <ArticleHeadImageFlavorImage
    v-else-if="renderArticleHeadImageFlavor"
    :block="block"
    :class="stretchedImageModifier"
  />
  <FigureImageFlavorImage v-else-if="renderFigureImageFlavor" :block="block" :class="stretchedImageModifier" />
  <AppImage v-else-if="renderBasicImage && imageUrl" :url="imageUrl" />
</template>

<script setup lang="ts">
import {
  GTMLinkAttributes,
  ImageBlock as ImageBlockType,
  isArticleHeadImageFlavor,
  isFigureImageFlavor,
} from 'perfapi';
import { computed, ref } from 'vue';

import AppImage from '@/components/AppImage.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import { useWhenPartlyInView } from '@/composables/in-view/use-when-in-view';
import { useGtm } from '@/utils/gtm';
import { resolveTargetUrl } from '@/utils/target';

import ArticleHeadImageFlavorImage from './ArticleHeadImageFlavorImage.vue';
import FigureImageFlavorImage from './FigureImageFlavorImage.vue';
import ImageBlock from './ImageBlock.vue';

const props = defineProps<{
  block: ImageBlockType;
  nested?: boolean;
}>();

const imageUrl = computed(() => props.block.image?.url);
const target = computed(() => props.block.target);
const url = computed(() => resolveTargetUrl(target.value));

const renderArticleHeadImageFlavor = computed(() => isArticleHeadImageFlavor(props.block.imageFlavor));
const renderFigureImageFlavor = computed(() => isFigureImageFlavor(props.block.imageFlavor));
const renderBasicImage = computed(() => !!(!props.block.imageFlavor && url));

const stretchedImageModifier = computed(() =>
  renderFigureImageFlavor.value || renderArticleHeadImageFlavor.value ? 'image-block--stretched' : '',
);

const linkAttributes: GTMLinkAttributes = {
  __typename: 'GTMLinkAttributes',
  category: 'article',
  action: 'image-click',
  label: url.value?.href,
};

const nestedBlock = computed(() => ({ ...props.block, target: undefined }));
const linkImage = ref<Element>();

if (url.value) {
  const gtm = useGtm();
  useWhenPartlyInView({
    target: linkImage,
    threshold: 0.5,
    callback: () =>
      gtm.add({
        event: 'image-with-url-in-view',
        'click-url': url.value?.href,
      }),
  });
}
</script>
<style lang="postcss">
.image-block {
  &--stretched {
    --column-area: stretched;
  }
}
</style>
