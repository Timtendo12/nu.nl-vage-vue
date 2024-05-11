<template>
  <div :class="classList">
    <link-template-thumb v-bind="props" thumb-optional has-marker />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import LinkTemplateThumb from '@/blocks/components/LinkBlock/templates/thumb.vue';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { useGtm } from '@/utils/gtm';
import { resolveTargetUrl } from '@/utils/target';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();

const list = ref<Element | undefined>();

const linkType = props.block.template === 'teaser' ? 'Zie-ook' : 'hyperlink';

const gtm = useGtm();
useWhenInView({
  target: list,
  callback: () =>
    gtm.add({
      event: 'link-block-in-view',
      'link-type': linkType,
      'click-url': resolveTargetUrl(props.block.link?.target)?.href,
    }),
});

const classList = computed(() => {
  const classes = ['link-block', 'link-block--teaser', 'states--hover'];
  if (props.showReadState) classes.push('link-block--read-state');
  return classes;
});
</script>

<style lang="postcss">
.link-block--teaser {
  --thumbnail-max-width: 6.25rem;
  --color-label-one: var(--color-dark-blue-one);

  > .link-block--thumb {
    padding: var(--grid-base--x4);
    background-color: var(--color-bg--z0);
    border: 2px solid var(--color-border--z0);
    border-radius: var(--border-radius);

    .item-title {
      &__label {
        display: table;
        font-weight: 700;
      }

      &__text {
        &:hover,
        &:focus {
          text-decoration: underline;
        }
      }
    }

    &:hover,
    &:focus {
      text-decoration: none;

      .item-title__text {
        text-decoration: underline;
      }
    }
  }
}

/* stylelint-disable */
[data-theme='dark'] {
  .link-block--teaser {
    --color-label-one: var(--color-body-base);
  }
}
/* stylelint-enable */
</style>
