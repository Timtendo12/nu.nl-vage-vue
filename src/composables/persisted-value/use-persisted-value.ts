import { computed, Ref, ref } from 'vue';

import { StorageType, useStorage } from '@/composables/storage/use-storage';

/**
 * Keep track of a value which is read from the store at mount and will be saved
 * to the store back at set. It doesn't re-read value from the store beside the
 * initial read so if there are more writers at some point in time it can be desynchronized
 * with the actual value in the store.
 * @param name of the value instance
 * @param type type of the store that will be used, it can be either local or session
 * @returns a reference to the value instance which will allow to observe changes
 */
export const usePersistedValue = <T>(
  name: string,
  type: StorageType = StorageType.Session,
  options: { ttl: string | number } = { ttl: '1d' },
): Ref<T | undefined> => {
  const { get, set, clear } = useStorage<T>(name, type, options);
  const instance = ref<T | undefined>();
  let isInit = false;
  const wrapper = computed({
    get: () => {
      if (!isInit) {
        instance.value = get();
        isInit = true;
      }
      return instance.value;
    },
    set: (val) => {
      if (val !== undefined && val !== null) {
        set(val);
      } else {
        clear();
      }
      instance.value = val;
    },
  });
  return wrapper;
};
