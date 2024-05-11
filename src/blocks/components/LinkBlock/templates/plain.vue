<template>
  <span ref="linkBlockContainerRef" class="link-block link-block--plain">
    <link-template-thumb v-bind="props" />
    <link-template-text v-bind="props" />
  </span>
</template>

<script setup lang="ts">
import LinkTemplateText from '@/blocks/components/LinkBlock/templates/text.vue';
import LinkTemplateThumb from '@/blocks/components/LinkBlock/templates/thumb.vue';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();
</script>

<style lang="postcss">
.link-block--plain {
  .link-block--text {
    display: none;
  }
}

/* If screen wide enough and not in sidebar */
@media only screen and (min-width: 992px) {
  .columns__main,
  .article {
    .link-block--plain {
      .link-block--text {
        display: flex;
      }

      .link-block--thumb {
        display: none;
      }
    }
  }
}
</style>
