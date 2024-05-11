<template>
  <div v-show="showError" class="tweet-error">Oeps! We hadden geen toegang tot deze Tweet.</div>
  <div ref="tweetEl" class="tweet-embed__content" />
</template>

<script lang="ts">
export default {
  name: 'TweetEmbed',
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { TwitterEmbedBlockFlavor } from 'perfapi';
import { onMounted, onUnmounted, ref, WatchStopHandle } from 'vue';

import { createTweet } from '@/components/Tweet/Tools';
import { usePreferencesStore } from '@/stores/preferences';

const props = defineProps<TwitterEmbedBlockFlavor>();

const preferencesStore = usePreferencesStore();

const showError = ref(false);
const tweetEl = ref<HTMLElement>();

const isValidTweet = (): boolean =>
  !!(props.tweetId && props.conversation && props.cards && props.width && props.align);

const addTweet = (): Promise<void> => {
  if (tweetEl.value && isValidTweet()) {
    return createTweet(tweetEl.value, props.tweetId!, {
      cards: props.cards!,
      conversation: props.conversation!,
      width: props.width!,
      align: props.align!,
      theme: preferencesStore.theme,
    })
      .then(() => undefined)
      .catch(() => {
        showError.value = true;
      });
  } else {
    return Promise.reject(new Error(`Cannot find target to attach tweet`));
  }
};

const removeTweet = (): void => {
  const container = tweetEl.value;
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
};

let unwatchTheme: WatchStopHandle | undefined;

onMounted(() => {
  preferencesStore.$subscribe(() => {
    removeTweet();
    addTweet();
  });

  addTweet();
});

onUnmounted(() => unwatchTheme?.());
</script>
