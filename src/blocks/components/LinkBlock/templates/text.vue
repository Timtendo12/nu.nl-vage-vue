<template>
  <app-target-link v-if="linkTarget" :target="linkTarget" :class="classList" :gtm-link-attributes="gtmLinkAttributes">
    <AppIcon v-if="prefixIcon" embed width="18" class="item__prefix-icon">
      <component :is="prefixIcon" />
    </AppIcon>
    <div v-if="showMarker" class="item-marker"></div>
    <div ref="linkItem" :class="classListTitleWrapper">
      <div>
        <link-partial-partner v-if="byline && brandImage" :caption="byline" :image="brandImage" />
        <span v-else-if="byline" class="item-byline">{{ byline }}</span>
      </div>
      <link-partial-title :title="title" :label="label" />
    </div>
    <AppIcon v-if="suffixIcon" embed width="18" class="item__suffix-icon">
      <component :is="suffixIcon" />
    </AppIcon>
  </app-target-link>
</template>

<script setup lang="ts">
import { isGraphic, isGTMTrackers, isSmallArticleLinkFlavor, isTextLinkFlavor, isVideoTarget } from 'perfapi';
import { computed, ref } from 'vue';

import LinkPartialPartner from '@/blocks/components/LinkBlock/LinkPartials/partner.vue';
import LinkPartialTitle from '@/blocks/components/LinkBlock/LinkPartials/title.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import { mapPerfApiIcon } from '@/components/icons';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { useGtm } from '@/utils/gtm';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();

const linkFlavor = props.block.link?.linkFlavor;
const linkTarget = computed(() => props.block.link?.target);
const title = computed(() => props.block.link?.title?.text);
const label = computed(() => (isSmallArticleLinkFlavor(linkFlavor) ? linkFlavor.label?.text : ''));

const prefixIcon = computed(() =>
  isTextLinkFlavor(linkFlavor) && linkFlavor.prefixIcon && isGraphic(linkFlavor.prefixIcon)
    ? mapPerfApiIcon(linkFlavor.prefixIcon.name)
    : null,
);
const suffixIcon = computed(() =>
  isTextLinkFlavor(linkFlavor) && linkFlavor.suffixIcon && isGraphic(linkFlavor.suffixIcon)
    ? mapPerfApiIcon(linkFlavor.suffixIcon.name)
    : null,
);

const byline = computed(() => {
  if (isVideoTarget(linkTarget.value)) return;
  return isSmallArticleLinkFlavor(linkFlavor) ? linkFlavor.byline?.text : null;
});

const brandImage = computed(() => (isSmallArticleLinkFlavor(linkFlavor) ? linkFlavor.brandIcon : null));

const linkItem = ref<Element | undefined>();

const gtm = useGtm();

useWhenInView({
  target: linkItem,
  callback: () => {
    if (props.isPartner) {
      gtm.add({
        event: 'smarticle-in-view',
        action: props.gtmLinkAttributes?.action,
        label: props.gtmLinkAttributes?.label,
      });
    }
    if (isGTMTrackers(linkTarget.value?.GTMTrackers)) {
      linkTarget.value.GTMTrackers.view?.forEach((tracker) => {
        const gtmData = tracker.data ? { [tracker.data.key]: tracker.data.value } : {};
        gtm.add({
          event: tracker.event,
          ...gtmData,
        });
      });
    }
  },
});

const classList = computed(() => {
  const classes = ['link-block', 'link-block--text'];
  if (props.showReadState) classes.push('link-block--read-state');
  if (byline.value) classes.push('link-block--has-byline');
  return classes;
});

const classListTitleWrapper = computed(() => {
  const classes = ['title-wrapper'];
  if (suffixIcon.value) classes.push('title-wrapper--has-suffix-icon');
  if (!props.showMarker) classes.push('title-wrapper--no-marker');
  return classes;
});
</script>

<style lang="postcss">
.link-block--text {
  display: flex;
  align-items: center;
  width: 100%;

  .item-marker {
    &::before {
      display: block;
      width: 7px;
      height: 7px;
      content: '';
      background-color: var(--brand-color);
      border-radius: 50%;
    }
  }

  &.link-block--has-byline {
    align-items: flex-start;

    .item-marker {
      &::before {
        transform: translateY(100%);
      }
    }
  }

  .item-title {
    flex: 0 0 100%;
    width: 100%;
  }

  .title-wrapper {
    display: flex;
    flex: 1 1 auto;
    flex-flow: column-reverse wrap;
    width: 100%;
    margin-left: var(--grid-base--x2);

    &--has-suffix-icon {
      flex: 0 1 auto;
      width: auto;

      .item-title {
        flex: 0 1 auto;
        width: auto;
      }
    }

    &--no-marker {
      margin-left: var(--grid-base--x4);
    }
  }

  .item-byline {
    font-size: 0.875rem;
    font-weight: 400;
    line-height: calc(16 / 14);
    color: var(--color-grey-five);
  }

  &:hover,
  &:focus {
    .item-title {
      text-decoration: underline;
    }
  }

  .item__suffix-icon {
    margin-left: var(--grid-base--x2);
  }
}
</style>
