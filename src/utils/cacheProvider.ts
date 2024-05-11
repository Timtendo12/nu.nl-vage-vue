import { CacheProvider, CacheTypes } from '@server/services/cacheProviders';
import { inject, InjectionKey } from 'vue';

type InMemoryBackingCache = Record<string, Record<string, string>>;

export class InMemoryCacheProvider implements CacheProvider {
  private _dict: InMemoryBackingCache;
  constructor() {
    this._dict = {};
  }
  get(type: CacheTypes, key: string): Promise<string | null> {
    this._dict[type.toString()] = this._dict[type.toString()] || {};
    return Promise.resolve(this._dict[type.toString()][key]);
  }

  set(type: CacheTypes, key: string, value: string): Promise<void> {
    this._dict[type.toString()] = this._dict[type.toString()] || {};
    this._dict[type.toString()][key] = value;
    return Promise.resolve();
  }
}

export class BrowserCacheProvider implements CacheProvider {
  get(): Promise<string | null> {
    return Promise.resolve(null);
  }

  set(): Promise<void> {
    return Promise.resolve();
  }
}

export const cacheProviderKey: InjectionKey<CacheProvider> = Symbol('cacheProvider');

export const useCacheProvider = (): CacheProvider => {
  const cacheProvider = inject<CacheProvider>(cacheProviderKey);
  if (!cacheProvider) throw new Error('CacheProvider not registered.');
  return cacheProvider;
};
