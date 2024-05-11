<template>
  <AppModal
    v-if="showPopUp"
    :close-func="handleClose"
    class="breaking-push-modal"
    class-modifier="breaking-push"
    :close-gtm-attributes="closeGTMAttributes"
    aria-labelledby="breaking-push-modal__title"
    aria-describedby="breaking-push-modal__body"
  >
    <AppModalTitle id="breaking-push-modal__title">Mis geen belangrijk nieuws</AppModalTitle>
    <p id="breaking-push-modal__body">
      Wil je als eerste via NU.nl op de hoogte blijven met meldingen van het belangrijkste nieuws?
    </p>
    <AppButton
      class="breaking-push-modal__button"
      :gtm-button-attributes="subscribeGTMAttributes"
      colorway="green"
      @click="subscribe"
      ><AppIcon embed embed-alt="" class="breaking-push-modal__button-icon" width="15" height="15">
        <IconMegaphone></IconMegaphone> </AppIcon
      >Zet meldingen aan</AppButton
    >
  </AppModal>
</template>

<script setup lang="ts">
import { GTMLinkAttributes } from 'perfapi';
import { onMounted, ref, watch } from 'vue';

import AppModal from '@/components/AppModal/AppModal.vue';
import { usePersistedValue } from '@/composables/persisted-value/use-persisted-value';
import { StorageType } from '@/composables/storage/use-storage';
import { DpnsRef, useDpns } from '@/utils/dpns';
import { useGtm } from '@/utils/gtm';

import AppButton from './AppButton.vue';
import AppIcon from './AppIcon.vue';
import AppModalTitle from './AppModal/AppModalTitle.vue';
import IconMegaphone from './icons/IconMegaphone.vue';

const showPopUp = ref(false);

const closeGTMAttributes: GTMLinkAttributes = {
  __typename: 'GTMLinkAttributes',
  category: 'notifications',
  action: 'close',
  label: 'webpush-popup',
};
const subscribeGTMAttributes: GTMLinkAttributes = {
  __typename: 'GTMLinkAttributes',
  category: 'notifications',
  action: 'click',
  label: 'webpush-popup',
};

let dpns: DpnsRef;
const subscribe = async () => {
  if (!dpns) return;
  const subscribed = await dpns.instance?.subscribe();
  if (subscribed) {
    dpns.instance?.addBreaking();
  }
  showPopUp.value = false;
};

const handleClose = () => {
  showPopUp.value = false;
};

const popUpSeen = usePersistedValue<boolean>('NU.webpush_popup_shown', StorageType.Local, { ttl: '10y' });

const notificationAvailable = typeof Notification !== 'undefined';
const permissionDenied = notificationAvailable && Notification.permission === 'denied';

if (!popUpSeen.value && notificationAvailable && !permissionDenied) {
  dpns = useDpns();
  const gtm = useGtm();

  onMounted(() => {
    const onDpnsLoadedChange = async (loaded: boolean) => {
      const hasBreakingTag = await dpns.instance?.hasTag('breaking_nu');
      if (loaded && hasBreakingTag === false) {
        showPopUp.value = true;
        popUpSeen.value = true;
        gtm.add({
          event: 'web-push-popup-in-view',
        });
      }
    };
    if (dpns.isLoaded.value) {
      onDpnsLoadedChange(true);
    } else {
      watch(dpns.isLoaded, onDpnsLoadedChange);
    }
  });
}
</script>

<style lang="postcss">
.breaking-push-modal {
  &__button {
    display: inline-block;
    align-self: center;
    padding: var(--grid-base--x3) var(--grid-base--x4);
    margin: var(--grid-base--x4) 0 0;

    &-icon {
      margin-right: var(--grid-base--x2);
      vertical-align: top;
    }
  }
}
</style>
