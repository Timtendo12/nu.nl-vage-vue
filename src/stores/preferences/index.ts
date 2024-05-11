import Cookies from 'js-cookie';
import { defineStore } from 'pinia';

import { isBrowser } from '@/utils/environment';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
}

export const isTheme = (t: unknown): t is Theme =>
  typeof t === 'string' && (Object.values(Theme) as string[]).includes(t);

export const defaultTheme = Theme.Light;

// do not modify the name of the cookie without changing it in BFF as well.
export const themeCookieName = 'NU.preferences.theme';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    theme: Theme.Light,
  }),
  actions: {
    setTheme(newTheme: Theme) {
      if (isTheme(newTheme)) {
        this.theme = newTheme as Theme;
        Cookies.set(themeCookieName, newTheme, { expires: 3650 });

        if (isBrowser()) {
          document.documentElement.setAttribute('data-theme', newTheme);
        }
      }
    },
    toggleTheme() {
      this.setTheme(this.theme === Theme.Light ? Theme.Dark : Theme.Light);
    },
  },
});
