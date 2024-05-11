<template>
  <div v-if="talk2022ServerData.enabled && !inFallbackMode" id="nujij" ref="talk2022Block" class="talk2022">
    <DividerBlock v-if="!isComponentPage" class="talk2022__divider" />
    <AppHeader class="talk2022__header">NUjij-reacties</AppHeader>

    <ErrorBlock v-if="talk2022LoginLoadState === 'FAILED'">
      Kon niet inloggen in NUjij. Probeer het later nog eens.
    </ErrorBlock>

    <template v-if="showCoralWidget">
      <Talk2022Widget
        v-if="isLoggedIn"
        ref="talk2022WidgetInstance"
        :story-url="storyUrl"
        :talk2022-url="talk2022Url"
        :comment-id="route.query.commentID"
        @talk2022-event="handleTalk2022Event"
      />
      <Talk2022LoginWall v-else />
    </template>
    <talk-2022-button v-else :count="talk2022ServerData.count" data-label="via-nujij-block"></talk-2022-button>
  </div>
</template>

<script setup lang="ts">
import Cookies from 'js-cookie';
import { computed, onBeforeMount, onMounted, Ref, ref, watch } from 'vue';
import { RouteLocationNormalizedLoaded, useRoute, useRouter } from 'vue-router';

import ErrorBlock from '@/blocks/components/ErrorBlock.vue';
import Talk2022Button from '@/blocks/components/Talk2022Block/Talk2022Button.vue';
import AppHeader from '@/components/AppHeader.vue';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { useContextStore } from '@/stores/context';
import { NujijState as Talk2022ServerData } from '@/stores/nujij';
import { useUserStore } from '@/stores/user';
import { login, logout } from '@/utils/auth';
import { getEnvVariable } from '@/utils/config';
import { useGtm } from '@/utils/gtm';
import { retry } from '@/utils/retry';
import { talk2022EventToGTMGenericTag } from '@/utils/talk2022';

import DividerBlock from '../DividerBlock.vue';
import { Talk2022EmitEvent, Talk2022WidgetInstance } from './Talk2022';
import Talk2022LoginWall from './Talk2022LoginWall.vue';
import Talk2022Widget from './Talk2022Widget.vue';

// Should be less than actual JWT expiration which is 90 days as defined in the talk-api. Using 30 days to be safe and have some slack.
// See: https://bitbucket.org/persgroep/nunl-talk-api/src/2cedb58f69e355cca67fa7b4fc42b9faa10f48cd/src/services/talk.py#lines-36
const TALK_JWT_COOKIE_EXPIRES_IN_DAYS = 30;
const TALK_JWT_COOKIE_NAME = 'talk_jwt';
const TALK_JWT_RETRIEVE_URL = '/1.0/auth/talk-jwt';
const talk2022WidgetInstance = ref<Talk2022WidgetInstance>();
type Talk2022LoginLoadState = 'INITIAL' | 'LOADING' | 'FAILED' | 'DONE';
type ScreenInfo = {
  logged_in?: string;
  account_id?: string;
  page_type: string;
  content_id: string;
};

const props = defineProps<{
  talk2022ServerData: Talk2022ServerData;
  isComponentPage?: boolean;
}>();

const { inFallbackMode } = useContextStore();

const shouldShowCoralWidget = (route: RouteLocationNormalizedLoaded) =>
  route.hash === '#nujij' || !!route.query.commentID || props.isComponentPage;

const router = useRouter();
const route = useRoute();

let gtm = useGtm();
const talk2022Block = ref<Element>();

const showCoralWidget = ref(false);

const talk2022LoginLoadState: Ref<Talk2022LoginLoadState> = ref('INITIAL');

const talk2022Url = computed(() => getEnvVariable('VITE_TALK2022_URL') as string);
const idFromPath = /\/(\d+)\//.exec(route.path)?.[1] || '';
const idFromComponentsPath = /\/(\d+)/.exec(route.path)?.[1] || '';

const userStore = useUserStore();
const user = computed(() => userStore.user);
const isLoggedIn = computed(() => !!userStore.user?.UID);

onBeforeMount(async () => {
  // Convert `commentId` to `commentID` queryparameter
  // Reason: make legacy talkv4 urls that use this old parameter to be forwards compatible with talk2022
  if (route.query.commentId) {
    const { commentId, ...restQuery } = route.query;
    router.push({ path: route.path, query: { ...restQuery, commentID: commentId }, hash: '#nujij' });
  }

  if (route.query.commentID) {
    router.push({ path: route.path, query: route.query, hash: '#nujij' });
  }
});

onMounted(() => {
  if (props.isComponentPage) {
    let screenInfo: ScreenInfo = { page_type: 'comments', content_id: idFromComponentsPath };
    if (isLoggedIn.value) {
      screenInfo.account_id = user.value!.UID;
      screenInfo.logged_in = 'true';
    } else {
      screenInfo.logged_in = 'false';
    }
    gtm.add({
      screen_info: screenInfo,
    });
  }
  if (shouldShowCoralWidget(route)) {
    showCoralWidget.value = true;
  }
});

watch(route, (_, newValue) => {
  if (shouldShowCoralWidget(newValue)) {
    showCoralWidget.value = true;
  }
});

useWhenInView({ target: talk2022Block, callback: () => gtm.add({ event: 'nujij-in-view' }) });

const storyUrl = computed(() => {
  const talk2022StoryUrl = getEnvVariable('VITE_TALK2022_STORY_URL');
  if (route.path.includes('/components/')) {
    return route.path.includes('/video/')
      ? `${talk2022StoryUrl}/${idFromComponentsPath}/video/redirect.html`
      : `${talk2022StoryUrl}/artikel/${idFromComponentsPath}/redirect.html`;
  } else {
    return route.path.includes('/video/')
      ? `${talk2022StoryUrl}/${idFromPath}/video/redirect.html`
      : `${talk2022StoryUrl}/artikel/${idFromPath}/redirect.html`;
  }
});

const logoutIfNeeded = () => {
  if (!isLoggedIn.value) {
    talk2022WidgetInstance.value?.logout();
  }
};

const createTalkToken = async () => {
  const apiUrl = getEnvVariable('VITE_TALK_API_URL') as string;

  const body = new URLSearchParams();
  body.append('dpg_component_at', userStore.pipTokens?.['dpg-component-at'] || '');
  const response = await retry(
    fetch,
    `${apiUrl}${TALK_JWT_RETRIEVE_URL}`,
    {
      method: 'POST',
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    },
    3,
  );
  const data = await response.json();
  return data.talk_jwt;
};

const loginToTalk = async (instance: Talk2022WidgetInstance) => {
  if (!isLoggedIn.value || talk2022LoginLoadState.value === 'LOADING') return;

  const shouldRefreshToken = !Cookies.get(TALK_JWT_COOKIE_NAME) || talk2022LoginLoadState.value !== 'INITIAL';

  talk2022LoginLoadState.value = 'LOADING';
  try {
    if (shouldRefreshToken) {
      const talkJWT = await createTalkToken();
      const options = { expires: TALK_JWT_COOKIE_EXPIRES_IN_DAYS };
      Cookies.set(TALK_JWT_COOKIE_NAME, talkJWT, options);
    }
    instance.login(Cookies.get(TALK_JWT_COOKIE_NAME) as string);
    talk2022LoginLoadState.value = 'DONE';
  } catch (e) {
    talk2022LoginLoadState.value = 'FAILED';
    Cookies.remove(TALK_JWT_COOKIE_NAME);
    console.error(e);
  }
};

const handleTalk2022Event = (talk2022Event: Talk2022EmitEvent<unknown>) => {
  const gtmGenericTag = talk2022EventToGTMGenericTag(talk2022Event);
  if (gtmGenericTag) {
    gtm.add(gtmGenericTag);
  }

  switch (talk2022Event.eventName) {
    case 'ready':
      loginToTalk(talk2022WidgetInstance.value as Talk2022WidgetInstance);
      break;
    case 'loginPrompt':
      if (isLoggedIn.value) {
        loginToTalk(talk2022WidgetInstance.value as Talk2022WidgetInstance);
      } else {
        const _talk2022LoginPromptEvent = talk2022Event as Talk2022EmitEvent<{ label: string; commentID?: string }>;
        const eventLabel = _talk2022LoginPromptEvent.data?.label;
        const commentID = _talk2022LoginPromptEvent.data?.commentID;

        const trackingAttributes: { [key: string]: string } = {
          dpg_medium: 'nujij',
          dpg_campaign: idFromPath,
          dpg_content: route.path.includes('video') ? 'video' : 'article',
        };

        if (eventLabel) {
          trackingAttributes.dpg_term = eventLabel;
        } else {
          // the default
          trackingAttributes.dpg_term = 'register-to-comment';
        }

        if (commentID) {
          const url = new URL(document.location.href);
          url.searchParams.set('commentID', commentID);

          login(trackingAttributes, url.href);
        } else {
          login(trackingAttributes);
        }
      }
      break;
    case 'signOut.success':
      Cookies.remove(TALK_JWT_COOKIE_NAME);
      logout();
      break;
    default:
      break;
  }

  if (talk2022Event.eventName !== 'signOut.success') {
    logoutIfNeeded();
  }
};
</script>

<style lang="postcss">
.talk2022 {
  &__header,
  &__divider {
    margin-bottom: var(--block-spacing);
  }
}
</style>
