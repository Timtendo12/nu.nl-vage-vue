import { decode64String } from '@server/utils/tokenUtils';
import { Block } from 'perfapi';

import { Theme } from '@/stores/preferences';
import { getPostMessage } from '@/utils/bridge/helpers';
import {
  AppMessage,
  AppMessageType,
  ErrorAppMessage,
  ErrorWebMessage,
  HeightChangeWebMessage,
  ReadyWebMessage,
  SetBlocksAppMessage,
  SetThemeAppMessage,
  WebMessage,
  WebMessageType,
} from '@/utils/bridge/types';
import { Sentry } from '@/utils/sentry';

type MessageListener = (message: AppMessage) => void;

/**
 * Message listeners queue.
 */
let messageListeners: MessageListener[] = [];

const subscribe = (listener: MessageListener) => messageListeners.push(listener);

const unsubscribe = (listener: MessageListener) => {
  messageListeners = messageListeners.filter((f) => f !== listener);
};

/**
 * Register $bridge instance on window which contains `postMessage` method
 * which will be used by mobile app to propagate messages to SPA.
 */
if (typeof window !== 'undefined' && typeof window.$bridge === 'undefined') {
  window.$bridge = {
    postMessage: (value: string) => {
      try {
        const message = JSON.parse(value);
        messageListeners.forEach((f) => f(message));
      } catch (error) {
        sendError({ errorMessage: `Cannot parse received message: ${value}` });
        Sentry.captureException(error);
      }
    },
  };
}

export const listenToAppMessage = <T extends AppMessage>(
  type: AppMessageType,
  handler: (message: T) => void,
): (() => void) => {
  const listener: MessageListener = (message: AppMessage) => {
    if (message.type === type) {
      handler(message as T);
    }
  };
  subscribe(listener);
  return () => {
    unsubscribe(listener);
  };
};

/**
 * Registers a handler to observe incoming messages from
 * mobile app.
 * @param eventHandler Handler to which message will be propagated.
 * @returns A closure which can be used to unregister handler.
 */
export const onBlocks = (eventHandler: (blocks: Block[]) => void): (() => void) =>
  listenToAppMessage(AppMessageType.SetBlocks, (message: SetBlocksAppMessage) => {
    try {
      const blocks = JSON.parse(decode64String(message.blocks));
      eventHandler(blocks);
    } catch (error) {
      sendError({ errorMessage: `Cannot parse received blocks: ${message.blocks}` });
      Sentry.captureException(error);
    }
  });

/**
 * Registers a handler to observe incoming SetTheme messages from
 * a mobile app.
 * @param eventHandler Handler to which message will be propagated.
 * @returns A closure which can be used to unregister handler.
 */
export const onTheme = (eventHandler: (theme: Theme) => void): (() => void) =>
  listenToAppMessage(AppMessageType.SetTheme, (message: SetThemeAppMessage) => eventHandler(message.theme));

export const makeSequence = (prefix: string): (() => string) => {
  let current = 1;
  return (): string => `${prefix}-${current++}`;
};

/**
 * Generate unique message id which will used to match response
 * to its original request.
 */
export const getId = makeSequence('f1');

/**
 * Post message to app, and waits for a response.
 * @param message Partial message which will be send.
 * @param response_type Expecting response type.
 * @param timeout Time after which request will be expired if
 * matching response has not been received by than.
 * @returns Promise which will deliver the response if any, or an error otherwise
 */
export const postMessageToApp = (
  message: Omit<WebMessage, 'id'>,
  responseType: AppMessageType,
  timeout?: number,
): Promise<AppMessage> => {
  const postMessage = getPostMessage();
  if (!postMessage) {
    // message handler was not registered
    return Promise.reject({
      code: 500,
      reason: 'WebView postMessage is not available',
    });
  }
  const id = getId();
  // ensure postMessage call is async
  setTimeout(() => postMessage(JSON.stringify({ id, ...message })));
  // keep waiting for response, or timeout
  return new Promise((resolve, reject) => {
    let timedout = false;

    const listener: MessageListener = (response) => {
      if (response.id === id && !timedout) {
        if (response.type == AppMessageType.Error) {
          reject((response as ErrorAppMessage).reason);
        } else if (response.type == responseType) {
          resolve(response);
        } else {
          reject({
            code: 500,
            reason: `Unexpected response type: ${response.type}. Expecting ${responseType}`,
          });
        }
        unsubscribe(listener);
      }
    };

    subscribe(listener);

    if (timeout) {
      setTimeout(() => {
        timedout = true;
        unsubscribe(listener);
        reject({ code: 408, reason: 'Request timeout' });
      }, timeout);
    }
  });
};

/**
 * Sends content height to mobile app.
 * @param height Current content height.
 * @param timeout Timeout after which request will be expired.
 * @returns Promise which will deliver response from the app back.
 */
export const sendHeight = ({ height, timeout }: { height: number; timeout?: number }): Promise<AppMessage> => {
  const message = {
    type: WebMessageType.HeightChange,
    height: height,
  } as Omit<HeightChangeWebMessage, 'id'>;
  return postMessageToApp(message, AppMessageType.Ok, timeout);
};

/**
 * Sends `ready` message to mobile app.
 * @param timeout Timeout after which request will be expired.
 * @returns Promise which will deliver response from the app back.
 */
export const sendReady = ({ timeout }: { timeout?: number }): Promise<AppMessage> => {
  const message = {
    type: WebMessageType.Ready,
  } as Omit<ReadyWebMessage, 'id'>;
  return postMessageToApp(message, AppMessageType.Ok, timeout);
};

/**
 * Sends `error` message to mobile app.
 * @param errorMessage Error description message.
 * @param timeout Timeout after which request will be expired.
 * @returns Promise which will deliver response from the app back.
 */
export const sendError = ({
  errorMessage,
  timeout,
}: {
  errorMessage: string;
  timeout?: number;
}): Promise<AppMessage> => {
  const message = {
    type: WebMessageType.Error,
    reason: errorMessage,
  } as Omit<ErrorWebMessage, 'id'>;
  return postMessageToApp(message, AppMessageType.Error, timeout);
};
