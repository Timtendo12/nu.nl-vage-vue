import timeConstants from 'time-constants';

import { isBrowser } from '../../utils/environment';

export enum StorageType {
  Local,
  Session,
}

const { DAYS_PER_WEEK, HOURS_PER_DAY, MINUTES_PER_HOUR, SECONDS_PER_MINUTE } = timeConstants;

/**
 * Construct expire date string from relative time in easy to read string
 * or number of seconds.
 * @param ttl: string | number - easy to read string or number of seconds
 * @returns a string that represent a properly formatted expiration date
 * @example `1y2M2w6d` => `2021-08-27T08:36:23.732Z`
 */
const dateFromRelativeTime = (time: string | number): string => {
  const time_string = typeof time === 'number' ? `${time}s` : time;
  // split the string to chunks containing 1 or more digits + 1 char.
  // Floats are not supported (e.g. .5d => 5d, use 12h instead)
  // If no TTL is provided, a day is ought to be enough.
  const time_parts = time_string.replace(/\s/gi, '').match(/\d+(?:\D)/gi) ?? ['1d'];
  const expiry_date = new Date();
  let seconds_to_add = 0;

  const secondsInDay = SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;
  const legend: Record<string, number> = {
    s: 1,
    m: SECONDS_PER_MINUTE,
    h: SECONDS_PER_MINUTE * MINUTES_PER_HOUR,
    d: secondsInDay,
    w: secondsInDay * DAYS_PER_WEEK,
    M: secondsInDay * 30,
    Q: secondsInDay * 91,
    y: secondsInDay * 365,
  };

  for (let i = 0, m = time_parts.length; i < m; i++) {
    // split string in count and unit.
    const arr = time_parts[i].split(/(:?\D)/);
    // convert to seconds, to later add to expiry date.
    seconds_to_add += legend[arr[1]] * parseInt(arr[0], 10);
  }
  // append seconds to
  expiry_date.setSeconds(expiry_date.getSeconds() + seconds_to_add);
  return expiry_date.toJSON();
};

/**
 * StorageAdapter for local/session storage.
 * @param name name of instance. Will also be used (slugified) as name for local/session storage.
 * @param type StorageType .Local or .Session. Defaults to .Session.
 * @param options: key/value pair of additional options
 *    ttl: ttl string (1s, 1m, 1d) or seconds. Defaults to 1 day.
 *
 *     Supported units:
 *       years           y
 *       quarters        Q
 *       months          M
 *       weeks           w
 *       days            d
 *       hours           h
 *       minutes         m
 *       seconds         s
 *
 * Example string: 1y2M2w6d
 */
export const useStorage = <T>(
  name: string,
  type: StorageType = StorageType.Session,
  options: { ttl: string | number } = { ttl: '1d' },
): {
  get: () => T | undefined;
  set: (data: T) => void;
  clear: () => void;
} => {
  // allowing the use of type to be 'local' or 'session'. Defaults to session.

  // check whether local/session storage is available.
  // If not, we're in Node environment and this function becomes a shell.
  const store_enabled = isBrowser();

  // prevent storage to barf over malformed names: use slug instead of name.
  const slug = ((str) => encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16)))(name);

  const ttl = typeof options === 'object' ? options.ttl : '1d';
  const expiry_date = dateFromRelativeTime(ttl);

  // Prevent execution if not all required parameters have been provided.
  if (!name) {
    throw new TypeError('Invalid parameter: name not specified.');
  }

  if (!slug || slug === 'undefined') {
    throw new TypeError('Invalid parameter: name could not be slugified.');
  }

  const currentStorage = (): Record<string, string> =>
    type === StorageType.Local ? window.localStorage : window.sessionStorage;

  // if in Node environment, store inside this var:
  let store = '';

  // This function removes the slug from the storage.
  const clear = (): void => {
    if (store_enabled) {
      const storage = currentStorage();
      storage[slug] = '';
      delete storage[slug];
      store = '';
    }
  };

  // Retrieve data. All data is stored in JSON.
  const get = (): T | undefined => {
    if (store_enabled) {
      let storage:
        | {
            expires: string;
            data: T;
          }
        | undefined = undefined;

      try {
        storage = JSON.parse(currentStorage()[slug]);
      } catch (e) {
        clear();
        return undefined;
      }

      try {
        if (storage !== undefined && Date.parse(storage.expires) >= Date.now()) {
          // Data is valid, return it.
          return storage.data;
        } else {
          // Data is invalid. Remove the slug from the storage, to prevent clutter.
          clear();
        }
      } catch (e) {
        clear();
        return undefined;
      }
      return undefined;
    } else {
      try {
        return JSON.parse(store);
      } catch (e) {
        return undefined;
      }
    }
  };

  // Store data. All data is stored in JSON.
  const set = (data: T): void => {
    if (store_enabled) {
      const storage = currentStorage();
      storage[slug] = JSON.stringify({
        expires: expiry_date,
        data: data,
      });
    } else {
      store = JSON.stringify(data);
    }
  };
  return { get, set, clear };
};
