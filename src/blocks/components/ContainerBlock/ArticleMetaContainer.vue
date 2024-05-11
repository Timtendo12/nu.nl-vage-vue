<template>
  <component :is="tag" ref="articleMeta" :class="`article-meta article-meta--${position}`">
    <div class="article-meta__static">
      <block-resolver v-for="block in blocks" :key="block.id" :block="block" class="article-meta__static-info" />
    </div>
    <div class="article-meta__interactive" :aria-hidden="ariaHidden">
      <talk-2022-button v-if="enabled" :count="count" class="article-meta__nujij-link" :position="position" />
      <social-sharing :position="position" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { ArticleMetaContainer, Block } from 'perfapi';
import { computed, ref } from 'vue';

import BlockResolver from '@/blocks/BlockResolver.vue';
import Talk2022Button from '@/blocks/components/Talk2022Block/Talk2022Button.vue';
import SocialSharing from '@/components/SocialSharing.vue';
import { useWhenFullyInView } from '@/composables/in-view/use-when-in-view';
import { useNuJijStore } from '@/stores/nujij';
import { useGtm } from '@/utils/gtm';

const props = defineProps<{
  blocks: Block[];
  flavor: ArticleMetaContainer;
}>();

const nujijStore = useNuJijStore();
const enabled = computed(() => nujijStore.enabled);
const count = computed(() => nujijStore.count);

const position = props.flavor.location === 'TOP' ? 'top' : 'bottom';
const tag = props.flavor.location === 'TOP' ? 'header' : 'footer';
const articleMeta = ref<Element>();
let ariaHidden = false;

if (props.flavor.location === 'TOP') {
  ariaHidden = true;
}

if (props.flavor.location === 'END') {
  const gtm = useGtm();
  useWhenFullyInView({ target: articleMeta, callback: () => gtm.add({ event: 'article-end-in-view' }) });
}
</script>

<style lang="postcss">
.article-meta {
  overflow: visible !important;

  &__static {
    display: flex;
    flex-direction: column;
    row-gap: var(--grid-base);
  }

  &__static-info {
    font-size: var(--font-size-meta);
    line-height: var(--line-height-meta);
  }

  &__interactive {
    display: flex;
    flex-wrap: wrap;
    gap: var(--grid-base--x4);
    align-items: center;
  }

  &--top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(--grid-base--x2);
    align-items: center;

    .article-meta__static-info {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .article-meta__interactive {
      flex-shrink: 0;
    }

    .social-sharing {
      display: none;

      @media (--c1-cols-min580), (--c2-main-col-min580) {
        display: block;
      }
    }
  }

  &--bottom {
    display: flex;
    flex-flow: row-reverse wrap;
    gap: var(--grid-base--x4);
    align-items: center;
    justify-content: flex-end;

    .article-meta__interactive {
      margin-right: auto;
    }
  }
}
</style>
