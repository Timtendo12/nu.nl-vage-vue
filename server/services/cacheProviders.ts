import { LRUCache } from 'lru-cache';

const oneHourInMilliSeconds = 60 * 60 * 1000;

export interface CacheProvider {
  set(type: CacheTypes, key: string, value: string): Promise<void>;
  get(type: CacheTypes, key: string): Promise<string | null>;
}

export enum CacheTypes {
  Menus = 'Menus',
  Ads = 'Ads',
}

export const SettingsPerCacheTypes = {
  [CacheTypes.Menus]: { size: 1, ttl: oneHourInMilliSeconds },
  [CacheTypes.Ads]: { size: 100, ttl: oneHourInMilliSeconds },
};

type BackingCache = Record<string, LRUCache<string, string>>;

export class LRUCacheProvider {
  backingCache: BackingCache;

  constructor() {
    this.backingCache = Object.keys(SettingsPerCacheTypes).reduce((prev, curr) => {
      const convertedCacheType = curr as CacheTypes;
      prev[curr] = new LRUCache({
        max: SettingsPerCacheTypes[convertedCacheType].size,
        ttl: SettingsPerCacheTypes[convertedCacheType].ttl,
      });
      return prev;
    }, {} as BackingCache);
  }

  set(type: string, key: string, value: string): Promise<void> {
    this.backingCache[type].set(key, value);
    return Promise.resolve();
  }

  get(type: string, key: string): Promise<string | null> {
    const value = this.backingCache[type].get(key);
    return Promise.resolve(value || null);
  }
}
