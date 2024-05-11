<template>
  <component :is="componentToRender" :blocks="block.blocks" :flavor="block.webContainerFlavor" />
</template>

<script lang="ts">
import { isArticleMetaContainer, isContentListContainer, isStyledWebContainer } from 'perfapi';
import { computed, defineComponent } from 'vue';

import ContentList from '../ContentList/ContentList.vue';
import ArticleMetaContainer from './ArticleMetaContainer.vue';
import StyledWebContainer from './StyledWebContainer.vue';

export default defineComponent({
  components: {
    ContentList,
    StyledWebContainer,
    ArticleMetaContainer,
  },
});
</script>

<script setup lang="ts">
import { ExtendedContainerBlock } from '@/stores/content';

const props = defineProps<{
  block: ExtendedContainerBlock;
}>();

const componentToRender = computed(() => {
  if (isContentListContainer(props.block.webContainerFlavor)) {
    return 'content-list';
  }
  if (isStyledWebContainer(props.block.webContainerFlavor)) {
    return 'styled-web-container';
  }
  if (isArticleMetaContainer(props.block.webContainerFlavor)) {
    return 'article-meta-container';
  }
  return 'div';
});
</script>
