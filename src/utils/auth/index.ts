import { ssoConfig } from '@/composables/pip-sso/use-pip-sso';
import { usePreferencesStore } from '@/stores/preferences';
import { isBrowser } from '@/utils/environment';
import * as location from '@/utils/location';

export const login = (trackingProperties: Record<string, string> = {}, nextUrl?: string): void => {
  const preferencesStore = usePreferencesStore();

  let encodedUrl = encodeURIComponent(document.location.href);
  if (nextUrl) {
    encodedUrl = encodeURIComponent(nextUrl);
  }

  const queryElements: Record<string, string> = {
    originalUrl: encodedUrl,
    theme: preferencesStore.theme,
    ...trackingProperties,
  };

  const queryString =
    '?' +
    Object.keys(queryElements)
      .map((key) => `${key}=${queryElements[key]}`)
      .join('&');

  location.assign(`/login${queryString}`);
};

export const ssoLogout = (logoutUrl: string): void => {
  if (isBrowser() && window.ssoDetection) {
    window.ssoLogout.logout({ ...ssoConfig(), logoutUrl: logoutUrl });
  }
};

export const logout = (): void => {
  const preferencesStore = usePreferencesStore();

  // add originalUrl to logout, so after logout the user will be redirected to it
  const originalUrl = encodeURIComponent(document.location.href);
  const logoutUrl = `/logout?originalUrl=${originalUrl}&theme=${preferencesStore.theme}`;

  // Component pages use the normal logout as /logout is being intercepted by the apps
  if (window.location.pathname.startsWith('/components')) {
    location.assign(logoutUrl);
  } else {
    ssoLogout(logoutUrl);
  }
};

export const showProfile = () => {
  location.assign('https://mijnomgeving.nu.nl');
};
