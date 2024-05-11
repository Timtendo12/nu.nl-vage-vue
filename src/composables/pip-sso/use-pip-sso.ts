import { useHybridScripts } from 'vue3-hybrid-scripts';

import { defaultTheme, Theme } from '@/stores/preferences';

type PIPTheme = 'LIGHT' | 'DARK';

type ssoConfigSettings = {
  topLevelDomain: string;
  authorizeUrl: () => string;
  logoutUrl: string;
  logoUrl: string;
  bannerConfig: string;
  loggedInEmail?: string;
  intraSsoEnabled: boolean;
  automaticLoginEnabled: boolean;
  multipleSessionsPopupEnabled: boolean;
  noSessionsCallback?: () => void;
  sessionCallback?: () => void;
  multipleSessionsCallback?: () => void;
  loggedInPopupShownCallback?: () => void;
  loggedInPopupHideCallback?: () => void;
  preRedirectCallback?: () => void;
  preSwitchAccountCallback?: () => void;
  multipleSessionsPopupLoginCallback?: () => void;
  multipleSessionsPopupShownCallback?: () => void;
  multipleSessionsPopupHideCallback?: () => void;
  brandName?: string;
  automaticLoginTimeout?: string;
  multipleSessionsPopupDismissTimeout?: string;
  theme?: PIPTheme;
};

export interface SSODetection {
  trigger: (ssoConfig: ssoConfigSettings) => void;
}

export interface SSOLogout {
  logout: (ssoConfig: ssoConfigSettings) => void;
}
export const runPipSso = (ssoConfig: ssoConfigSettings, email?: string) => {
  ssoConfig.loggedInEmail = email;
  window.ssoDetection.trigger(ssoConfig);
};

export const ssoConfig = (theme = defaultTheme): ssoConfigSettings => {
  const host = window.location.host;
  const originalUrl = encodeURIComponent(window.location.href);
  const authorizeUrl = `https://${host}/login?originalUrl=${originalUrl}`;

  return {
    topLevelDomain: 'nl',
    authorizeUrl: () => authorizeUrl,
    logoutUrl: '',
    logoUrl: `https://www.nu.nl/assets/favicon/nu_logo.svg?v=1`,
    bannerConfig: 'NL-Newspaper',
    loggedInEmail: '',
    intraSsoEnabled: false,
    automaticLoginEnabled: true,
    multipleSessionsPopupEnabled: true,
    theme: theme.toUpperCase() as PIPTheme,
  };
};

export const usePipSso = (email?: string, theme?: Theme) => {
  useHybridScripts(['https://login-static.dpgmedia.net/ssosession/main.js'], () => {
    // intra domain sso is handled by server
    runPipSso(ssoConfig(theme), email);
  });
};
