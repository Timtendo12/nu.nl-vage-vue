<template>
  <component
    :is="getComponent"
    :key="block.id"
    :block="block"
    :index="index"
    :gtm-link-attributes="computedGtmLinkAttibutes"
    :is-partner="isPartner"
    :show-read-state="showReadState"
    :show-marker="shouldShowMarker"
    :target-group-ids="targetGroupIds"
  />
</template>

<script setup lang="ts">
import {
  GTMLinkAttributes,
  isGTMLinkAttributes,
  isJWPlayerVideoTarget,
  isScreenTarget,
  isTextLinkFlavor,
  isVideoTarget,
  Link,
  LinkBlock,
  ScreenTarget,
} from 'perfapi';
import { type Component, computed } from 'vue';

import LinkTemplateButton from '@/blocks/components/LinkBlock/templates/button.vue';
import LinkTemplateDatetime from '@/blocks/components/LinkBlock/templates/datetime.vue';
import LinkTemplateGrid from '@/blocks/components/LinkBlock/templates/grid.vue';
import LinkTemplateHero from '@/blocks/components/LinkBlock/templates/hero.vue';
import LinkTemplateMarker from '@/blocks/components/LinkBlock/templates/marker.vue';
import LinkTemplateMore from '@/blocks/components/LinkBlock/templates/more.vue';
import LinkTemplateMoreComments from '@/blocks/components/LinkBlock/templates/MoreComments.vue';
import LinkTemplatePlain from '@/blocks/components/LinkBlock/templates/plain.vue';
import LinkTemplateRanked from '@/blocks/components/LinkBlock/templates/ranked.vue';
import LinkTemplateTeaser from '@/blocks/components/LinkBlock/templates/teaser.vue';
import LinkTemplateText from '@/blocks/components/LinkBlock/templates/text.vue';
import LinkTemplateThumb from '@/blocks/components/LinkBlock/templates/thumb.vue';
import LinkTemplateTimestamp from '@/blocks/components/LinkBlock/templates/timestamp.vue';
import { getGtmLinkAttributes } from '@/utils/gtm';
import sanitiseObject from '@/utils/object-sanitiser/object-sanitiser';

export type NonNullableLinkBlock = LinkBlock & { link: Link };
export type LinkBlockProps = {
  block: LinkBlock;
  gtmLinkAttributes?: GTMLinkAttributes;
  header?: string;
  index?: number;
  isPartner?: boolean;
  parentTemplate?: string;
  showReadState?: boolean;
  showMarker?: boolean;
};

const DEFAULT_LINK_TEMPLATE = 'plain';

const props = defineProps<LinkBlockProps>();

const shouldShowMarker = !isTextLinkFlavor(props.block.link?.linkFlavor);

const getComponent = computed<Component>(() => {
  const linkFlavorTemplateMap: Record<string, string> = {
    ButtonLinkFlavor: 'button',
    TimelineLinkFlavor: 'teaser',
    LargeArticleLinkFlavor: 'hero',
    MoreLinkFlavor: 'more',
    TextLinkFlavor: 'text',
  };

  const templateComponentMap: Record<string, Component> = {
    'all-comments': LinkTemplateMoreComments,
    button: LinkTemplateButton,
    datetime: LinkTemplateDatetime,
    grid: LinkTemplateGrid,
    hero: LinkTemplateHero,
    link: LinkTemplateTeaser,
    more: LinkTemplateMore,
    plain: LinkTemplatePlain,
    ranked: LinkTemplateRanked,
    tag: LinkTemplateMarker,
    teaser: LinkTemplateTeaser,
    thumb: LinkTemplateThumb,
    timeline: LinkTemplatePlain,
    timestamp: LinkTemplateTimestamp,
    text: LinkTemplateText,
  };

  const linkFlavor =
    props.block.link?.linkFlavor?.__typename && linkFlavorTemplateMap[props.block.link.linkFlavor.__typename];

  const template = props.block.template || props.parentTemplate || linkFlavor || DEFAULT_LINK_TEMPLATE;

  return templateComponentMap[template] || templateComponentMap[DEFAULT_LINK_TEMPLATE];
});

const computedGtmLinkAttibutes = computed(() => {
  const componentLinkTypeMap: Record<string, string> = {
    more: 'more',
    teaser: 'Zie-ook',
  };

  const componentName = (getComponent.value as { __name: string }).__name;
  const linkType = componentLinkTypeMap[componentName] || 'hyperlink';

  // Only pick the GTM trackers that are not null or undefined from the BFF
  const webTrackers = isGTMLinkAttributes(props.block.link?.target?.GTMTrackers?.click)
    ? sanitiseObject<GTMLinkAttributes>(props.block.link.target.GTMTrackers.click)
    : {};

  return {
    ...getGtmLinkAttributes({ block: props.block, linkType }),
    ...props.gtmLinkAttributes,
    ...webTrackers,
  };
});

const itemId = isScreenTarget(props.block.link?.target) ? (props.block.link.target as ScreenTarget).targetId : '';

const showReadState =
  (itemId !== '' || isVideoTarget(props.block.link?.target) || isJWPlayerVideoTarget(props.block.link?.target)) &&
  props.block.type !== 'timeline' &&
  props.block.type !== 'section' &&
  !isTextLinkFlavor(props.block.link?.linkFlavor);

const targetGroupIds = computed(() => props.block.link?.groupIds);
</script>

<style lang="postcss">
@media (max-width: 992px) {
  .text-center--mobile {
    .link-block--text {
      justify-content: center;

      .title-wrapper {
        flex: 0 1 auto;
        width: auto;
      }
    }
  }
}

.link-block--read-state {
  &:visited {
    color: var(--color-link-one-visited);

    .item-title__title-label,
    .item-title__title-label-divider {
      color: var(--color-link-one-visited);
    }
  }
}
</style>
