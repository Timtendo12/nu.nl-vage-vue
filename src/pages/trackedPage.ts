/*
  Provides tracking, privacy gate and VWO to pages.
*/

import { OutputMode } from '@server/middleware/OutputMode';
import Cookies from 'js-cookie';
import { isDataLayerScreenViewEvent } from 'perfapi';
import { computed, onMounted } from 'vue';

import { useContentStore } from '@/stores/content';
import { useContextStore } from '@/stores/context';
import { useUserStore } from '@/stores/user';
import { consentHasPersonalisation } from '@/utils/consent';
import { useGtm } from '@/utils/gtm';
import { transformDataLayerScreenViewToDictionary } from '@/utils/gtm/data-layer';
import { loadPrivacyGate, onConsentKnown } from '@/utils/privacyGate';
import { isVWOEnabled, runVWO } from '@/utils/vwo';

export function useTrackedPage() {
  const userStore = useUserStore();
  const contentStore = useContentStore();
  const contextStore = useContextStore();

  const UID = computed(() => userStore.user?.UID);

  onMounted(async (): Promise<void> => {
    const gtm = useGtm();
    await loadPrivacyGate(gtm);

    contentStore.screenTrackers?.show?.filter(isDataLayerScreenViewEvent).forEach((t) => {
      gtm.add({
        screen_info: {
          ...transformDataLayerScreenViewToDictionary(t.fields),
          fallback: String(contextStore.outputMode == OutputMode.FALLBACK),
        },
      });
    });

    onConsentKnown('marketing', (hasConsent) => {
      if (isVWOEnabled() && hasConsent) {
        runVWO();
      }
    });

    const dpgConsentString = Cookies.get('dpg-consent-string');
    if (UID.value && consentHasPersonalisation(dpgConsentString)) {
      gtm.add({ event: 'pip-account-id', 'user.account_id': UID.value });
    }
  });
}
