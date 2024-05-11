<template>
  <router-link v-if="isSpaNav" ref="linkBlockContainerRef" :to="path" :rel="rel" v-bind="attributes">
    <slot></slot>
  </router-link>
  <a
    v-else
    ref="linkBlockContainerRef"
    :href="url"
    :target="windowTarget"
    :rel="rel"
    v-bind="attributes"
    @click="onClick"
  >
    <slot></slot>
  </a>
</template>

<script setup lang="ts">
import { GTMLinkAttributes, Target } from 'perfapi';
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useWhenFullyInView } from '@/composables/in-view/use-when-in-view';
import { hasCookieFeatureFlag } from '@/utils/featureFlag';
import { createDataLinkAttributes, useGtm } from '@/utils/gtm';
import { updateConsent } from '@/utils/privacyGate';
import { isNunlDomain, resolveTargetRel, resolveTargetUrl } from '@/utils/target';
import { TeaserImpression, useTeaserImpressionTracking } from '@/utils/teaser-tracking';

const props = defineProps<{
  target: Target;
  gtmLinkAttributes?: GTMLinkAttributes;
  teaserImpression?: TeaserImpression;
  targetGroupIds?: string[];
}>();

const gtm = useGtm();
const linkBlockContainerRef = ref<Element>();
const teaserTracking = useTeaserImpressionTracking();

const trackNuVoorJou = () => {
  if (props.targetGroupIds?.includes('nuvoorjou_anonymous')) {
    gtm.add({
      dataCategory: 'login_wall',
      dataAction: 'click',
      dataLabel: 'nuvoorjou',
    });
  }
  if (props.targetGroupIds?.includes('nuvoorjou_noconsent')) {
    gtm.add({
      dataCategory: 'navigation',
      dataAction: 'click',
      dataLabel: 'nuvoorjou_noconsent',
    });
  }
};

useWhenFullyInView({
  target: linkBlockContainerRef,
  callback: () => {
    teaserTracking.add(props.gtmLinkAttributes, props.target);
  },
});

const attributes = computed(() => createDataLinkAttributes(props.gtmLinkAttributes));
const rel = computed(() => resolveTargetRel(props.target));
const url = computed(() => resolveTargetUrl(props.target)?.href || '');
const path = computed(() => new URL(url.value).pathname);
const isInternalRoute = computed(() => isNunlDomain(url.value));
const windowTarget = computed(() => (isInternalRoute.value ? '_self' : '_blank'));
const isSpaNav = computed(() => isInternalRoute.value && hasCookieFeatureFlag('spaNav'));

const onClick = (e: Event) => {
  trackNuVoorJou();

  try {
    const urlObj = new URL(url.value);
    const urlSearchParams = new URLSearchParams(urlObj.search);
    if (urlSearchParams.has('modal') && urlSearchParams.get('modal') === 'cookie-instellingen') {
      e.preventDefault();
      updateConsent();
    }
  } catch {
    // do default
  }
};
</script>
