<template>
  <component :is="getName(block.__typename)" v-bind="props"></component>
</template>

<script lang="ts">
import { defineComponent, inject, provide } from 'vue';

import AudioBlock from '@/blocks/components/AudioBlock.vue';
import BannerBlock from '@/blocks/components/BannerBlock.vue';
import ButtonBarBlock from '@/blocks/components/ButtonBarBlock.vue';
import CarouselLinkBlock from '@/blocks/components/CarouselLinkBlock/CarouselLinkBlock.vue';
import CommentBlock from '@/blocks/components/CommentBlock/CommentBlock.vue';
import ContainerBlock from '@/blocks/components/ContainerBlock/ContainerBlock.vue';
import DetailBlock from '@/blocks/components/DetailBlock.vue';
import DividerBlock from '@/blocks/components/DividerBlock.vue';
import EmbedBlock from '@/blocks/components/EmbedBlock/EmbedBlock.vue';
import ErrorBlock from '@/blocks/components/ErrorBlock.vue';
import FormElementBlock from '@/blocks/components/FormElementBlock/FormElementBlock.vue';
import HeaderBlock from '@/blocks/components/HeaderBlock.vue';
import ImageBlock from '@/blocks/components/ImageBlock/ImageBlock.vue';
import LinkBlock from '@/blocks/components/LinkBlock/LinkBlock.vue';
import MenuItemBlock from '@/blocks/components/MenuItemBlock.vue';
import PlaceholderBlock from '@/blocks/components/PlaceholderBlock/PlaceholderBlock.vue';
import RecommendedArticles from '@/blocks/components/RecommendedArticles.vue';
import SkeletonTextBlock from '@/blocks/components/SkeletonTextBlock.vue';
import SourceBlock from '@/blocks/components/SourceBlock.vue';
import TextBlock from '@/blocks/components/TextBlock/TextBlock.vue';
import VideoBlock from '@/blocks/components/VideoBlock.vue';
import WidgetBarBlock from '@/blocks/components/WidgetBarBlock/WidgetBarBlock.vue';
import WidgetLinkBlock from '@/blocks/components/WidgetLinkBlock.vue';

export const resolvedParentBlock = () => inject<Block>('RESOLVEDPARENTBLOCK');

export default defineComponent({
  components: {
    AudioBlock,
    BannerBlock,
    ButtonBarBlock,
    CarouselLinkBlock,
    CommentBlock,
    ContainerBlock,
    DetailBlock,
    DividerBlock,
    EmbedBlock,
    ErrorBlock,
    FormElementBlock,
    HeaderBlock,
    ImageBlock,
    LinkBlock,
    MenuItemBlock,
    PlaceholderBlock,
    RecommendedArticles,
    SkeletonTextBlock,
    SourceBlock,
    TextBlock,
    VideoBlock,
    WidgetBarBlock,
    WidgetLinkBlock,
  },
});
</script>

<script setup lang="ts">
import { Block } from 'perfapi';

import { isInAppViewKey } from '@/utils/environment';

const props = defineProps<{ block: Block }>();

provide('RESOLVEDPARENTBLOCK', props.block);

const unsupportedInAppViewBlocks = ['WidgetBarBlock', 'WidgetLinkBlock'];
const isInAppView = inject(isInAppViewKey);

const getName = (type: string | undefined): string | null => {
  if (isInAppView && type && unsupportedInAppViewBlocks.includes(type)) {
    return null;
  }
  return type ? `${type}`.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace(/^-/, '') : 'error-block';
};
</script>
