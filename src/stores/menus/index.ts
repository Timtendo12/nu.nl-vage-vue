import { CacheTypes } from '@server/services/cacheProviders';
import { Menus } from 'perfapi';
import { defineStore } from 'pinia';

import { ContentCacheKeys } from '@/stores/content';
import { PaddedMenus, styleMenus } from '@/utils/converters';

import { useErrorStore } from '../errors';

export const useMenusStore = defineStore('menus', {
  state: (): PaddedMenus => ({
    mainMenu: [],
    siteOverview: [],
    mainMenuEditorials: [],
    footerEditorials: [],
  }),
  actions: {
    async getMenus(): Promise<void> {
      const errorsStore = useErrorStore();
      try {
        const cachedMenus = await this.cacheProvider.get(CacheTypes.Menus, ContentCacheKeys.menus);
        let menus: Menus;
        if (cachedMenus) {
          menus = JSON.parse(cachedMenus) as Menus;
        } else {
          menus = await this.bffClient.menus();
          await this.cacheProvider.set(CacheTypes.Menus, ContentCacheKeys.menus, JSON.stringify(menus));
        }
        const mappedMenus = styleMenus(menus);
        this.mainMenu = mappedMenus.mainMenu;
        this.siteOverview = mappedMenus.siteOverview;
        this.mainMenuEditorials = mappedMenus.mainMenuEditorials;
        this.footerEditorials = mappedMenus.footerEditorials;
      } catch (error) {
        errorsStore.handleError(error);
      }
    },
  },
});
