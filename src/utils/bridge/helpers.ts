import { PostMessage } from '@/utils/bridge/types';

/**
 * Determines if android message handler has been defined.
 * @returns `true` in case handler is present `false` otherwise.
 */
export const hasAndroidPostMessage = (): boolean => !!(typeof window !== 'undefined' && window.f1bridge?.postMessage);

/**
 * Determines if ios message handler has been defined.
 * For more information please check documentation on Apple developer portal:
 * https://developer.apple.com/documentation/webkit/wkscriptmessagehandler?language=swift#overview
 * @returns `true` in case handler is present `false` otherwise.
 */
export const hasWebKitPostMessage = (): boolean =>
  !!(typeof window !== 'undefined' && window.webkit?.messageHandlers?.f1bridge?.postMessage);

/**
 * Returns postMessage function exposed by apps if handler
 * was registered or null otherwise.
 */
export const getPostMessage = (): PostMessage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  // Android
  if (hasAndroidPostMessage()) {
    // Native Android can receive only primitive types.
    return (message: string): void => window.f1bridge?.postMessage?.(message);
  }
  // iOS
  if (hasWebKitPostMessage()) {
    // Checking if scriptMessageHandler was registered.
    // About client side implementation more information can be found here:
    // https://developer.apple.com/documentation/webkit/wkscriptmessagehandler?language=swift#overview
    return (message: string): void => window.webkit?.messageHandlers?.f1bridge?.postMessage?.(message);
  }
  return null;
};
