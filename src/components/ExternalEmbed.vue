<template>
  <div ref="rootComponent">
    <div :id="sanitizedId" :class="['external-embed', currentClassname]"></div>
  </div>
</template>

<script setup lang="ts">
import * as pym from 'pym.js';
import { Parent, ParentOptions } from 'pym.js';
import { v4 as uuidv4 } from 'uuid';
import { computed, onMounted, onUnmounted, ref, WatchStopHandle } from 'vue';

import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { usePreferencesStore } from '@/stores/preferences';
import { useUserStore } from '@/stores/user';
import { login, logout, showProfile } from '@/utils/auth';

const preferencesStore = usePreferencesStore();
const userStore = useUserStore();
const theme = preferencesStore.theme;

const props = defineProps<{
  url: string;
  id?: string;
  useAuth?: boolean;
  classname?: string;
  lazy?: boolean;
}>();

const rootComponent = ref<Element>();
let frameParent = ref<Parent>();

const currentClassname = computed(() => props.classname || 'externalembed');
const sanitizedId = computed(() => (props.id ? props.id.replace(/=/g, '-') : uuidv4()));

let unwatchTheme: WatchStopHandle | undefined;

onMounted(() => {
  preferencesStore.$subscribe(() => {
    provideTheme();
  });

  if (!props.lazy) {
    ensureParentExists();
  }
});

useWhenInView({
  target: rootComponent,
  callback: () => {
    if (props.lazy) {
      ensureParentExists();
    }
  },
});

onUnmounted(() => {
  unwatchTheme?.();
});

const sendMessage = (name: string, payload: { [key: string]: string | number | unknown } | boolean) => {
  if (frameParent.value) {
    frameParent.value.sendMessage(name, JSON.stringify(payload));
  }
};

const provideTheme = () => {
  sendMessage('theme', { theme: theme });
};

// provide the game with information on the screen / outer frame
const provideScreenData = () => {
  const message = {
    // screen scroll position and dimensions
    pageYOffset: window.scrollY,
    pageXOffset: window.scrollX,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    // calculate position of f1game frame
    iframeOffset: (function (el) {
      const rect = el.getBoundingClientRect();
      const y = window.pageYOffset;
      const x = window.pageXOffset;
      return {
        top: rect.top + y,
        right: rect.right + x,
        bottom: rect.bottom + y,
        left: rect.left + x,
      };
    })(document.querySelector(`#${sanitizedId.value} > iframe`)),
    // also provide theme when requesting screen_data
    theme,
  };
  sendMessage('screen_info', message);
};

const providePIPData = () => {
  if (!userStore.user && userStore.pipTokens) {
    sendMessage('account_info', false);
    return;
  }
  const pipToken = userStore.pipTokens?.['dpg-component-at'];
  sendMessage('account_info', {
    pip_access_token: pipToken,
    profile: userStore.user,
  });
};

const createParent = (id: string, url: string, options: ParentOptions) =>
  typeof window !== 'undefined'
    ? typeof window.pym !== 'undefined'
      ? new window.pym.Parent(id, url, options)
      : new pym.Parent(id, url, options)
    : null;

const ensureParentExists = () => {
  if (frameParent.value) {
    return;
  }
  const parent = createParent(sanitizedId.value, props.url + window.location.search + window.location.hash, {
    trackscroll: true,
    scrollwait: 20,
  });
  if (!parent) {
    return;
  }
  // @ts-expect-error - pym types are not up to date, on window pym iframe is defined
  parent.iframe.onload = () => {
    provideTheme();
  };
  parent.onMessage('screen_info', provideScreenData);
  parent.onMessage('theme', provideTheme);
  if (props.useAuth) {
    parent.onMessage('account_info', providePIPData);
    parent.onMessage('login', () => login({ dpg_medium: 'socios', dpg_campaign: sanitizedId.value }));
    parent.onMessage('register', () => login({ dpg_medium: 'socios', dpg_campaign: sanitizedId.value }));
    parent.onMessage('logout', logout);
    parent.onMessage('account', showProfile);
  }

  frameParent.value = parent;
};
</script>

<style lang="postcss">
.external-embed {
  padding: 0;
  margin: 0;
}
</style>
