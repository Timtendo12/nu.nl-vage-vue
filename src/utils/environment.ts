import { InjectionKey } from 'vue';

/**
 * Detect in what scope we are working. Sometimes necessary.
 * Try to avoid usage if possible.
 */
export enum Environment {
  Client,
  Server,
}

export const isInAppViewKey: InjectionKey<boolean> = Symbol('isInAppViewKey');

export const isBrowser = (): boolean => typeof window !== 'undefined' && typeof window.document !== 'undefined';

// detect page is loaded in Sanoma apps webview
export const isInAppView = (userAgent: string): boolean => /sanoma\/app/i.test(userAgent);

export const environment = isBrowser() ? Environment.Client : Environment.Server;

export const legacyIsMobile = (userAgent: string): boolean =>
  [/Android/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i, /IEMobile/i, /Opera Mini/i].some((item) =>
    userAgent.match(item),
  );

export interface NavigatorUAData {
  readonly mobile: boolean;
}

export interface ExperimentalNavigator extends Navigator {
  readonly userAgentData?: NavigatorUAData;
}

export const isMobile = (): boolean => {
  if (!isBrowser()) {
    return false;
  }
  const uaIsMobile = (window.navigator as ExperimentalNavigator).userAgentData?.mobile;
  return typeof uaIsMobile === 'boolean' ? uaIsMobile : legacyIsMobile(window.navigator.userAgent);
};
