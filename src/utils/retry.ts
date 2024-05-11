import { isError } from './errors';

export const sleep = <R>(ms: number): Promise<R> => new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async (
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  input: RequestInfo,
  init?: RequestInit,
  retryCount = 2,
): Promise<Response> => {
  // It will cause a retry after `delay` only for status in `retryCodes`
  // as well as connection errors that didn't succeed to get a status code.
  // In case we run out of attempts or the status code is not in the list
  // response will be propagated back to a caller.
  const retryCodes = [408, 500, 502, 503, 504, 522, 524];
  try {
    const response = await fetch(input, init);
    if ((!response.ok || retryCodes.includes(response.status)) && retryCount > 0) {
      throw new Error('Invalid response.');
    }
    return response;
  } catch (error) {
    if (retryCount < 1 || (isError(error) && error.name === 'AbortError')) {
      throw error;
    }
    return retry(fetch, input, init, retryCount - 1);
  }
};
