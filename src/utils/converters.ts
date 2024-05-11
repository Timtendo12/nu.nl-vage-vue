import { MenuItem, Menus } from 'perfapi';

export interface PaddedMenuItem extends MenuItem {
  classNames?: string;
}

export type PaddedMenus = {
  mainMenu: PaddedMenuItem[];
  siteOverview: MenuItem[];
  mainMenuEditorials: MenuItem[];
  footerEditorials: MenuItem[];
};

export const styleMenus = (menus: Menus): PaddedMenus => {
  const classMap: Record<string, string> = {
    algemeen: 'app-hide--m',
    economie: 'app-hide--m',
    sport: 'app-hide--m',
    tech: 'app-hide--m',
    'cultuur en media': 'app-hide--m',
    'media en cultuur': 'app-hide--m',
    entertainment: 'app-hide--m',
    achterklap: 'app-hide--m',
    shop: 'app-hide--m',
    voorpagina: 'app-hide--d',
    'meest gelezen': 'app-hide--d',
    populair: 'app-hide--d',
  };

  const addClass = (item: MenuItem): PaddedMenuItem =>
    !item.title
      ? item
      : {
          ...item,
          classNames: classMap[item.title.toLowerCase()] || '',
        };

  return {
    mainMenu: menus.mainMenu?.map(addClass) || [],
    siteOverview: menus.siteOverview || [],
    mainMenuEditorials: menus.mainMenuEditorials || [],
    footerEditorials: menus.footerEditorials || [],
  };
};
