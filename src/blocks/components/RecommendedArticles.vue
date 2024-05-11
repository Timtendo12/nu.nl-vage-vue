<template>
  <section v-if="!inFallbackMode" ref="inview" class="recommended">
    <app-header class="recommended__header">Aanbevolen artikelen</app-header>
    <content-list :blocks="container" :flavor="flavor" />
  </section>
</template>

<script setup lang="ts">
import { ContentListContainer, Link, LinkBlock, RecommendedArticles, SmallArticleLinkFlavor } from 'perfapi';
import { ref } from 'vue';

import ContentList from '@/blocks/components/ContentList/ContentList.vue';
import AppHeader from '@/components/AppHeader.vue';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { ExtendedContainerBlock, useContentStore } from '@/stores/content';
import { useContextStore } from '@/stores/context';

defineProps<{ block: RecommendedArticles }>();

const skeletonBlock = {
  __typename: 'LinkBlock',
  link: {
    linkFlavor: {} as SmallArticleLinkFlavor,
    title: {},
  } as Link,
  template: 'thumb',
} as LinkBlock;

const placeholderAmount = 8; // 5 recommended articles + 3 ad positions
const skeletonBlocks = new Array(placeholderAmount).fill(skeletonBlock);

const container = ref(skeletonBlocks);
const inview = ref<Element>();
const contentStore = useContentStore();
const { inFallbackMode } = useContextStore();

const flavor = {
  __typename: 'ContentListContainer',
  template: 'thumb',
  header: 'Aanbevolen artikelen',
} as ContentListContainer;

useWhenInView({
  target: inview,
  callback: async () => {
    const recommendedArticles = await contentStore.getRecommendedArticles(window.location.pathname);

    if (recommendedArticles) {
      container.value = (recommendedArticles as ExtendedContainerBlock).blocks as LinkBlock[];
    }
  },
});
</script>

<style lang="postcss">
.recommended {
  --column-area: stretched;

  &__header {
    padding-right: var(--edge-spacing);
    padding-left: var(--edge-spacing);
    margin-bottom: var(--block-spacing);
  }
}

@media (--two-columns-fit) {
  .recommended {
    &__header {
      padding-right: 0;
      padding-left: 0;
    }
  }
}
</style>
