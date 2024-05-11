<template>
  <ul ref="list" :class="listClasses">
    <li v-for="(block, index) in filteredBlocks" :key="block.id" :class="listItemClasses((block as LinkBlock).link)">
      <link-block
        v-if="isLinkBlock(block)"
        :block="block"
        :header="header"
        :class="brandClass"
        :index="index"
        :parent-template="template"
        :gtm-link-attributes="linkSpecificGtmAttributes(block, index)"
      />
      <block-resolver v-else :block="block"></block-resolver>
    </li>
  </ul>
</template>

<script setup lang="ts">
import {
  Block,
  ContentListContainer,
  Grid,
  isGTMTrackers,
  isJWPlayerVideoTarget,
  isLargeArticleLinkFlavor,
  isLinkBlock,
  isVideoTarget,
  Link,
  type LinkBlock,
} from 'perfapi';
import { computed, ref } from 'vue';

import BlockResolver from '@/blocks/BlockResolver.vue';
import { useShouldBeShown } from '@/blocks/components/use/displayRules';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { getGtmLinkAttributes, getGtmListLinkAttributes, useGtm } from '@/utils/gtm';
import { resolveTargetUrl } from '@/utils/target';

import linkBlock from '../LinkBlock/LinkBlock.vue';

const shouldBeShown = useShouldBeShown();
const props = defineProps<{
  grid?: Grid | null;
  blocks: Block[];
  flavor: ContentListContainer;
  previousBlockData?: {
    header: string;
    blocksCount: number;
  };
}>();

const list = ref<Element | undefined>();
const template = computed(() => props.flavor?.template);
const filteredBlocks = computed(() => props.blocks.filter((block) => shouldBeShown(block.displayRule)));
const GTMTrackers = computed(() => props.flavor?.GTMTrackers || []);
const header = computed(() => props.flavor?.header || '');

const brandClass = computed(() => ['branded', `branded--${props.flavor.theme || 'nu'}`]);

const listClasses = computed(() => {
  const templateSpecificStyle = (() => {
    switch (template.value) {
      case 'timestamp':
        return [
          'contentlist--timestamp',
          'list-timeline',
          'list-timeline--centered',
          'list-timeline--infinite',
          'list--first-of-type',
        ];
      case 'datetime':
        return ['contentlist--datetime', 'list-timeline', 'list-timeline--branded'];
      case 'link':
        return ['contentlist--teaser'];
      default:
        return [`contentlist--${template.value}`];
    }
  })();

  return ['contentlist', ...templateSpecificStyle];
});

const listItemClasses = (link: Link | undefined) => [
  'contentlist__item',
  isLargeArticleLinkFlavor(link?.linkFlavor) ? 'contentlist__item--wide' : null,
];

const gtmListType = computed(() =>
  props.blocks?.every(
    (block) => isLinkBlock(block) && (isVideoTarget(block.link?.target) || isJWPlayerVideoTarget(block.link?.target)),
  )
    ? 'video'
    : 'article',
);

const linkType = computed(() => (template.value === 'teaser' ? 'Zie-ook' : 'hyperlink'));

// Collect template specific values
const templateSpecificData = computed(() => {
  switch (template.value) {
    case 'teaser':
    case 'link':
      return {
        gtm: {
          inViewAttr: {
            event: 'link-block-in-view',
            'link-type': linkType.value,
            'click-url': isLinkBlock(props.blocks[0]) ? resolveTargetUrl(props.blocks[0]?.link?.target)?.href : '',
          },
          isListItem: false,
        },
      };
    default:
      return {
        gtm: {
          inViewAttr: {
            event: `${gtmListType.value}-list-in-view`,
            'list-header': header.value || `${props.previousBlockData?.header}${props.previousBlockData?.blocksCount}`,
          },
          isListItem: true,
        },
      };
  }
});

const isListItem = computed(() => templateSpecificData.value.gtm.isListItem);

const linkSpecificGtmAttributes = (block: LinkBlock, index: number) => {
  let trackingIndex = index;

  // Assuming continuation of list: add previous blockscount to trackingIndex
  if (!header.value && props.previousBlockData?.blocksCount) {
    trackingIndex += props.previousBlockData?.blocksCount;
  }
  return isListItem.value
    ? getGtmListLinkAttributes({
        block,
        index: trackingIndex,
        title: header.value || props.previousBlockData?.header || '',
      })
    : getGtmLinkAttributes({ block, linkType: linkType.value });
};

const gtm = useGtm();

// Populate collected tacking data and add it to the event
useWhenInView({
  target: list,
  callback: () => {
    if (isGTMTrackers(GTMTrackers.value)) {
      GTMTrackers.value.view?.forEach((tracker) => {
        const gtmData = tracker.data ? { [tracker.data.key]: tracker.data.value } : {};
        gtm.add({
          event: tracker.event,
          ...gtmData,
        });
      });
    } else {
      gtm.add(templateSpecificData.value.gtm.inViewAttr);
    }
  },
});
</script>

<style lang="postcss">
.contentlist {
  --contentlist-item-gap: var(--grid-base--x4);

  position: relative;
  display: flex;
  flex-flow: column nowrap;
  gap: var(--contentlist-item-gap);
  padding: 0;
  margin: 0;
  list-style-type: none;

  &__item {
    font-size: var(--font-size-contentlist--s0);
    line-height: var(--line-height-contentlist--s0);
  }

  &--grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--grid-base--x8) var(--grid-base--x4);

    @media (min-width: 480px) and (max-width: 767px) {
      column-gap: var(--grid-base--x6);
    }

    @at-root .columns--no-sidebar & {
      @media (min-width: 767px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    @at-root .columns__main & {
      @media (min-width: 992px) {
        column-gap: var(--grid-base--x6);
      }
    }
  }

  &--timestamp {
    --contentlist-item-gap: var(--grid-base--x2);
  }

  &--datetime {
    --contentlist-item-gap: var(--grid-base--x6);
  }

  &--ranked {
    --contentlist-item-gap: var(--grid-base--x2);

    .contentlist__item {
      padding: 0;
    }
  }

  &--text {
    --contentlist-item-gap: var(--grid-base--x3);

    margin: 0;

    .contentlist__item {
      padding: 0;
    }
  }

  &--plain {
    .contentlist__item {
      .link-block--text {
        margin: 0;
      }
    }
  }

  &--plain,
  &--thumb {
    --column-area: stretched;

    .contentlist__item {
      &:not(&--wide) {
        padding-right: var(--edge-spacing);
        padding-left: var(--edge-spacing);
      }
    }
  }
}

@media (--c1-cols-min580) {
  .contentlist {
    /* stylelint-disable-next-line custom-property-pattern */
    --font-size-contentlist--s0: 1rem;
  }
}

@media (--c2-main-col-min580) {
  .columns__main {
    .contentlist {
      /* stylelint-disable-next-line custom-property-pattern */
      --font-size-contentlist--s0: 1rem;
    }
  }
}

@media (--two-columns-fit) {
  .contentlist {
    &--plain,
    &--thumb {
      .contentlist__item {
        &:not(&--wide) {
          padding-right: 0;
          padding-left: 0;
        }
      }
    }
  }
}

.list-timeline {
  --timeline-dot-y-position: var(--grid-base--x2);
  --timeline-dot-y-transform: 0;
  --timeline-dot-color: var(--color-grey-six);
  --timeline-dash-color: var(--color-grey-six);
  --timeline-left-padding: var(--grid-base--x4);
  --timeline-dash-before-content: '';
  --timeline-quote-before-content: none;

  position: relative;
  gap: 0;

  &::before {
    position: absolute;
    top: 0;
    left: 2px;
    width: 4px;
    height: 3px;
    content: var(--timeline-quote-before-content);
    border-top: 1px solid var(--timeline-dash-color);
    border-bottom: 1px solid var(--timeline-dash-color);
    transform: skewY(20deg);
  }

  &.list--first-of-type {
    &::before {
      top: auto;
      bottom: 0;
    }
  }

  &:not(.list--first-of-type) {
    .link-block--timestamp {
      &:first-child::before {
        top: 0;
        height: 150%;
      }

      &:last-child::before {
        display: none;
      }
    }
  }

  /* stylelint-disable-next-line no-descending-specificity */
  > li {
    position: relative;
    padding-bottom: var(--contentlist-item-gap);
    padding-left: var(--timeline-left-padding);

    .item-datetime {
      flex-basis: 2.5rem;
    }

    &::before,
    &::after {
      position: absolute;
      top: var(--timeline-dot-y-position);
      display: block;
      content: '';
    }

    &::before {
      left: 0.1875rem;
      width: 0;
      height: 100%;
      border-left: 1px dashed var(--timeline-dash-color);
      transform: translateY(3px);
    }

    &:last-child {
      --timeline-dash-before-content: none;

      padding-bottom: 0;

      &::before {
        height: 35%;
        content: var(--timeline-dash-before-content);
      }
    }

    &::after {
      left: 0.2188rem;
      width: 5px;
      height: 5px;
      background-color: var(--timeline-dot-color);
      border-radius: 50%;
      transform: translateY(var(--timeline-dot-y-transform)) translateX(-50%);
    }
  }

  &--centered {
    --timeline-dot-y-position: 50%;
    --timeline-dot-y-transform: -50%;
  }

  &--branded {
    --timeline-dot-color: var(--brand-color);
  }

  &--infinite {
    --timeline-quote-before-content: '';

    /* stylelint-disable-next-line no-descending-specificity */
    > li {
      &:last-child {
        --timeline-dash-before-content: '';
      }
    }
  }
}
</style>
