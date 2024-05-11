import Cookie from 'js-cookie';
import { useHybridScripts } from 'vue3-hybrid-scripts';

import { getEnvVariable } from '@/utils/config';

import { IGtm } from './gtm';

/**
 * The dpg-consent-string cookie used in the code is fetched by a script running in GTM
 * and set based on what the privacy gate sdk loads onto window._privacy.trackingCookie.
 **/

function setConsentCookie(): void {
  const cookieOptions = {
    expires: 365,
    path: '/',
    domain: location.hostname.replace(/^www\./i, ''),
    sameSite: 'None',
    secure: true,
  } as Cookie.CookieAttributes;

  const setCookie =
    (...args: string[]) =>
    (value: string) =>
      args.forEach((key) => Cookie.set(key, value, cookieOptions));

  // Implementation as defined and preferred by https://myprivacy-static.dpgmedia.net/docs/4-process-consent.html
  window._privacy?.push(['onTcString', setCookie('CookieConsent')]);
  window._privacy?.push(['onDpgConsentString', setCookie('tcf20_purposes', 'dpg-consent-string')]);
}
let privacyGateLoaded: Promise<void>;

export const loadPrivacyGate = async (gtm: IGtm): Promise<void> => {
  window.cmpProperties = {
    baseUrl: getEnvVariable('VITE_PRIVACY_GATE_BASE_URL'),
    cmpCname: getEnvVariable('VITE_PRIVACY_GATE_CMP_C_NAME'),
    language: getEnvVariable('VITE_PRIVACY_GATE_LANGUAGE'),
    privacyManagerId: getEnvVariable('VITE_PRIVACY_GATE_PRIVACY_MANAGER_ID'),
  };
  privacyGateLoaded = new Promise((resolvePrivacyGateLoaded) => {
    useHybridScripts(getEnvVariable('VITE_PRIVACY_GATE_CONSENT_SCRIPT') || '', () => {
      if (!Cookie.get('CookieConsent')) {
        window._privacy?.push(['functional', setConsentCookie]);
      }
      window._privacy?.push([
        'consentupdated',
        () => {
          // The gtm script also updates the tc20_purposes cookie here
          setConsentCookie();
          window.location.reload();
        },
      ]);
      gtm.add({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
      });
      resolvePrivacyGateLoaded();
      useHybridScripts(`https://www.googletagmanager.com/gtm.js?id=${gtm.containerId}&l=dataLayer`, () => {});
    });
  });
};

type IAB = number;

type ConsentIdentifier =
  | IAB
  | IAB[]
  | 'analytics'
  | 'contentrecommendation'
  | 'functional'
  | 'marketing'
  | 'nonpersonalisedads'
  | 'socialmedia'
  | 'targetedadvertising';

export const onConsentKnown = (consentType: ConsentIdentifier, callback: (hasConsent: boolean) => void) => {
  privacyGateLoaded.then(() => {
    window._privacy?.push([consentType, () => callback(true), () => callback(false)]);
  });
};

export const updateConsent = (): void => {
  if (!window._privacy || !window._privacy.openModal) {
    throw new Error('privacy gate not properly loaded, _privacy not set');
  }
  window._privacy.openModal();
};
