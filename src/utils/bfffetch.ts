import { OutputMode } from '@server/middleware/OutputMode';
import { MetricsService } from '@server/services/metricsServices';
import { serialize } from 'cookie';
import { Request as BFFRequest, Response as BFFResponse } from 'perfapi';

import { PipTokens } from '@/stores/user';
import { BfffetchConfig, getBfffetchConfig } from '@/utils/bfffetchConfig';
import { getEnvVariable } from '@/utils/config';
import { parseServerTimingHeader, ServerTimingMetric } from '@/utils/performance';
import { retry } from '@/utils/retry';

import { isError } from './errors';
import { Sentry } from './sentry';

const BFF_TIMEOUT = parseInt(getEnvVariable('VITE_PERFAPI_TIMEOUT', '20000'), 10);
const BFF_TIMEOUT_SIGNAL = 'BffFetchTimeout';

export const createMockBffFetch = () => bffFetch({ getPipTokens: jest.fn(), getCookie: jest.fn() });

export const bffFetch =
  ({
    getPipTokens,
    getCookie,
    onCookiesSet,
    onETagSet,
    ip,
    processController,
    metricsService,
    config = getBfffetchConfig(OutputMode.DEFAULT),
  }: {
    getPipTokens: () => PipTokens | undefined;
    getCookie: () => Record<string, string>;
    onCookiesSet?: (cookies: string | null) => void;
    onETagSet?: (etag: string | null) => void;
    ip?: string;
    processController?: AbortController;
    metricsService?: MetricsService;
    config?: BfffetchConfig;
  }): ((url: string, options: BFFRequest) => Promise<BFFResponse>) =>
  async (url: string, options: BFFRequest): Promise<BFFResponse> => {
    const headers: { [key: string]: string } = { ...options.headers };
    const cookies = getCookie();

    headers['x-consent'] = cookies['CookieConsent'] || '';
    headers['x-consent-purposes'] = cookies['dpg-consent-string'] || 'functional|analytics';

    const pipTokens = getPipTokens();
    const accessToken = pipTokens?.['dpg-component-at'];

    if (accessToken) {
      headers['authorization'] = `PIP ${accessToken}`;
    }

    if (ip) {
      headers['X-Forwarded-For'] = ip;
    }

    const dpnsDeviceSecret = cookies['x-dpns-device-token'];
    const dpnsDeviceToken = cookies['x-push-device-token'];
    if (dpnsDeviceToken && dpnsDeviceSecret) {
      headers['x-dpns-device-token'] = dpnsDeviceSecret;
      headers['x-push-device-token'] = dpnsDeviceToken;
    }

    headers['Cookie'] = Object.entries(cookies)
      .reduce((acc, [key, value]) => {
        acc.push(serialize(key, value));
        return acc;
      }, [] as string[])
      .join(';');

    let operationName = 'unknown';
    let variables = {};
    try {
      const parsedOptions = JSON.parse(options.body);
      operationName = parsedOptions.operationName;
      variables = parsedOptions.variables;
    } catch (e) {}
    const fetchController = new AbortController();

    // When main request is cancelled, cancel request to BFF as well.
    processController?.signal.addEventListener('abort', () => {
      fetchController.abort(processController.signal.reason);
    });

    const start = performance.now();
    const bffTimer = metricsService?.createTimer();
    const timeout = setTimeout(() => fetchController.abort(BFF_TIMEOUT_SIGNAL), BFF_TIMEOUT);
    let response = {} as Response;

    /*
    The BFF allows to add headers as param, these should be filtered out when config.passHeaders = false, however
    BFF calls without content-type fail, and user-agent is required to hint BFF the type of content we want
     */
    const requiredHeaders = ['content-type', 'x-client-user-agent'];
    const filteredHeaders = config.passHeaders
      ? headers
      : Object.entries(options.headers).filter(([key]) => requiredHeaders.includes(key.toLowerCase()));

    try {
      response = await retry(
        fetch,
        url,
        {
          body: options.body,
          headers: filteredHeaders,
          keepalive: true,
          method: options.method,
          signal: fetchController.signal,
        },
        2,
      );
      metricsService?.timing(`bffApi.${operationName}.fetchComplete`, bffTimer!());
    } catch (e) {
      const error = isError(e) ? e : new Error(String(e));
      const { aborted, reason } = fetchController.signal;

      if (!(aborted && reason === processController?.signal.reason)) {
        if (aborted) {
          error.name = reason;
          error.message = `Fetching from BFF took longer than ${BFF_TIMEOUT}ms.`;
        }

        Sentry.captureException({
          extra: {
            operationName,
            variables: JSON.stringify(variables),
            timeout: BFF_TIMEOUT,
            timing: metricsService ? bffTimer!() : undefined,
            url,
            method: options.method,
            headers: JSON.stringify(headers),
          },
          ...error,
        });
        metricsService?.increment(`bffApiError.${operationName}.${error.name}`, 1);
      }

      return {
        body: String(error),
        json: undefined,
        ok: false,
        // custom status code to recognize BFF timeouts in loadtests etc.
        status: aborted && reason === BFF_TIMEOUT_SIGNAL ? 599 : 504,
        statusText: error.name,
      };
    } finally {
      clearTimeout(timeout);
    }

    if (onETagSet && response.headers.has('etag')) {
      onETagSet(response.headers.get('etag'));
    }

    if (response.headers.has('server-timing')) {
      //record time it took fetching
      const took = performance.now() - start;
      const serverTimingHeader = response.headers.get('server-timing');
      // search for the total processing time of bff
      if (serverTimingHeader != null) {
        const metrics = parseServerTimingHeader(serverTimingHeader);
        const tptMetric = metrics.find((metric: ServerTimingMetric) => metric.name == 'tpt');
        if (tptMetric) {
          const bffProcessingTime = tptMetric.timing!;
          const bffTrafficTime = took - bffProcessingTime;
          metricsService?.timing('bff.processing', bffProcessingTime);
          metricsService?.timing('bff.traffic', bffTrafficTime);
        }
      }
    }

    if (onCookiesSet && config.setCookies) {
      onCookiesSet(response.headers.get('set-cookie'));
    }

    const json = await response.json();
    metricsService?.timing(`bffApi.${operationName}.parseComplete`, bffTimer!());

    return {
      body: '',
      json,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  };
