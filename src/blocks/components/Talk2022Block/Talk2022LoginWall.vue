<template>
  <div
    class="talk-load-more-banner"
    role="button"
    tabindex="0"
    @click="loginWithTracking('click-full-banner')"
    @keydown.enter="loginWithTracking('click-full-banner')"
    @keydown.space="loginWithTracking('click-full-banner')"
  >
    <span class="load-more-icon"></span>
    <h3 class="load-more-title">Log in en lees reacties</h3>
    <p class="load-more-text">
      Lees reacties, stel vragen aan de redactie, geef respect en praat mee over het belangrijkste nieuws.
    </p>
    <button
      class="talk-load-more-button talk-load-more-button-banner"
      @click.stop="loginWithTracking('register-banner')"
    >
      Gratis account aanmaken
    </button>
    <p class="load-more-text">
      Heb je al een account?
      <button class="load-more-login" @click.stop="loginWithTracking('login-banner')">Inloggen</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

import { login } from '@/utils/auth';
import { useGtm } from '@/utils/gtm';
import { talk2022EventToGTMGenericTag } from '@/utils/talk2022';
import { idFromPath } from '@/utils/target';

const route = useRoute();
const gtm = useGtm();

const loginWithTracking = (eventLabel: string) => {
  const talkEvent = { eventName: 'loginPrompt', data: { label: eventLabel } };
  const gtmTag = talk2022EventToGTMGenericTag(talkEvent);
  if (gtmTag) gtm.add(gtmTag);

  const trackingAttributes: { [key: string]: string } = {
    dpg_medium: 'nujij',
    dpg_campaign: idFromPath(route.path),
    dpg_content: route.path.includes('video') ? 'video' : 'article',
    dpg_term: eventLabel ?? 'register-to-comment',
  };

  login(trackingAttributes);
};
</script>

<style lang="postcss">
.talk2022 {
  /* Variables and styling originally from Coral */
  --palette-primary-700: hsl(83deg 84% 34%);
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;

  .talk-load-more-banner {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: center;
    justify-content: center;
    padding: var(--spacing-4);
    margin: var(--spacing-4) var(--spacing-3);
    font-family: var(--font-family-primary);
    text-align: center;
    cursor: pointer;
    border-radius: var(--spacing-2);
    box-shadow: 0 var(--spacing-1) var(--spacing-3) rgb(0 0 0 / 15%);
  }

  .load-more-icon {
    &::after {
      content: url("data:image/svg+xml,%3Csvg width='33' height='33' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cpath d='M.5 32.24h32v-32H.5v32Z' fill='url(%23a)'/%3E%3Cdefs%3E%3Cpattern id='a' patternContentUnits='objectBoundingBox' width='1' height='1'%3E%3Cuse xlink:href='%23b' transform='scale(.01563)'/%3E%3C/pattern%3E%3Cimage id='b' width='64' height='64' xlink:href='data:image/png;base64,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'/%3E%3C/defs%3E%3C/svg%3E");
    }

    margin: 0;
  }

  .load-more-title {
    margin: 0;
    font-size: var(--line-height-subline--s0);
  }

  .load-more-text {
    margin: 0;
    font-size: var(--font-size-body--s1);
    line-height: var(--line-height-body--s1);
  }

  .talk-load-more-button {
    width: 315px;
    max-width: 95%;
    padding: var(--spacing-2) var(--spacing-3);
    margin: 0;
    font-weight: var(--font-weight-bold, 700);
    color: white;
    background: var(--palette-primary-700);
    border: 1px solid var(--palette-primary-700);
    border-radius: var(--spacing-2);
  }

  .load-more-login {
    margin-left: var(--spacing-1);
    font-size: var(--font-size-body--s0);
    text-decoration: underline;
    cursor: pointer;
    background: none;
    border: none;
  }
}

[data-theme='dark'] .talk2022 {
  .talk-load-more-banner {
    box-shadow: none;
  }
}
</style>
