import Cookies from 'js-cookie';

const getFlagCookieName = (name: string) => `F1_FEATURE_FLAG_${name.toUpperCase()}`;

export const hasCookieFeatureFlag = (flagName: string): boolean => !!Cookies.get(getFlagCookieName(flagName));

export const enableCookieFeatureFlag = (flagName: string) => Cookies.set(getFlagCookieName(flagName), 'ENABLED');

export const disableCookieFeatureFlag = (flagName: string) => Cookies.remove(getFlagCookieName(flagName));
