import Cookies from 'js-cookie';
import { onMounted, Ref, ref } from 'vue';
import { useHybridScripts } from 'vue3-hybrid-scripts';

import { getEnvVariable } from '@/utils/config';

export interface DpnsClient {
  subscribe: () => Promise<boolean>;
  isSubscribed: () => Promise<boolean>;
  getTags: () => Promise<string[]>;
  addTag: (tag: string) => Promise<boolean>;
  addTags: (tags: string[]) => Promise<boolean>;
  removeTag: (tag: string) => Promise<boolean>;
  removeTags: (tags: string[]) => Promise<boolean>;
  deviceToken: string;
  deviceSecret: string;
  secret: string;
}

export interface DpnsInitOptions {
  debug?: boolean;
  secret: string;
  safariOptions?: {
    secret: string;
    bundleId: string;
  };
  onInitFinished?: (dpnsClient: DpnsClient) => void;
}

export interface DpnsRef {
  instance?: DpnsInterface;
  isLoaded: Ref<boolean>;
}

const dpnsRef: DpnsRef = { instance: undefined, isLoaded: ref(false) };

export const useDpns = () => {
  onMounted(() => {
    if (!dpnsRef.isLoaded.value) {
      useHybridScripts('https://web-sdk.dpns-notifications.com/v8/dpns.js', async () => {
        Dpns.initDpns();
      });
    }
  });

  return dpnsRef;
};

export interface DpnsInterface {
  getTags: () => Promise<string[]>;
  hasTag: (tag: string) => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  getDeviceSecret: () => string | undefined;
  addBreaking: () => Promise<boolean>;
}

class Dpns implements DpnsInterface {
  private dpnsClient?: DpnsClient;

  private constructor(client: DpnsClient) {
    this.dpnsClient = client;
  }

  public static initDpns(): void {
    const options: DpnsInitOptions = {
      debug: true,
      secret: getEnvVariable('VITE_DPNS_W3C_WEB_PUSH_SECRET') as string,
      safariOptions: {
        secret: getEnvVariable('VITE_DPNS_SAFARI_WEB_PUSH_SECRET') as string,
        bundleId: getEnvVariable('VITE_DPNS_SAFARI_WEB_PUSH_ID') as string,
      },
      onInitFinished: (dpnsClient: DpnsClient) => {
        const dpns = new Dpns(dpnsClient);
        dpnsRef.instance = dpns;
        if (dpnsClient.deviceToken) {
          Cookies.set('x-dpns-device-token', dpnsClient.deviceToken);
        } else {
          Cookies.remove('x-dpns-device-token');
        }
        if (dpnsClient.deviceSecret) {
          Cookies.set('x-push-device-token', dpnsClient.deviceSecret);
        } else {
          Cookies.remove('x-push-device-token');
        }
        dpnsRef.isLoaded.value = true;
      },
    };

    window.dpns = window.DPNS.init(options);
  }

  public async subscribe(): Promise<boolean> {
    console.log(this.dpnsClient);
    if (!this.dpnsClient) {
      return false;
    }
    let isSubscribed = await this.dpnsClient.isSubscribed();
    if (!isSubscribed) {
      isSubscribed = await this.dpnsClient.subscribe();
    }
    const deviceSecret = this.getDeviceSecret();
    if (deviceSecret) Cookies.set('x-push-device-token', deviceSecret);
    const deviceToken = this.getDeviceToken();
    if (deviceToken) Cookies.set('x-dpns-device-token', deviceToken);
    return isSubscribed;
  }

  public async addBreaking(): Promise<boolean> {
    return this.dpnsClient?.addTag('breaking_nu') || false;
  }

  public async getTags(): Promise<string[]> {
    return this.dpnsClient?.getTags() || [];
  }

  public async hasTag(tag: string): Promise<boolean> {
    return (await this.getTags()).includes(tag);
  }

  public getDeviceSecret() {
    return this.dpnsClient?.deviceSecret;
  }

  public getDeviceToken() {
    return this.dpnsClient?.deviceToken;
  }
}
