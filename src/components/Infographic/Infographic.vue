<template>
  <section class="infographic">
    <div :class="{ infographic__wrapper: true, 'infographic--nopym': usePym == false }">
      <div class="infographic--hasiframe">
        <ExternalEmbed v-if="usePym" :id="currentId" :url="currentUrl" :lazy="true"></ExternalEmbed>
        <div v-else class="infographic__content" :style="style">
          <iframe
            title="Infographic"
            :src="currentUrl"
            type="text/html"
            frameborder="0"
            allowfullscreen
            class="infographic__content-frame"
          ></iframe>
        </div>
      </div>
      <div v-if="provider || copyright" class="infographic__meta">
        <span v-if="provider" class="infographic__provider">
          Bron:
          <a v-if="providerUrl" :href="providerUrl" target="_blank" rel="nofollow">{{ provider }}</a>
          <span v-else>{{ provider }}</span>
        </span>
        <span v-if="copyright" class="infographic__copyright">&copy; {{ copyright }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { InfographicEmbedBlockFlavor } from 'perfapi';
import { computed, onMounted, onUnmounted, ref, watchEffect, WatchStopHandle } from 'vue';

import ExternalEmbed from '@/components/ExternalEmbed.vue';
import { usePreferencesStore } from '@/stores/preferences';

interface InfographicsProps extends InfographicEmbedBlockFlavor {
  id: string;
}
const props = defineProps<InfographicsProps>();

function hashCode(str: string): number {
  return str
    .split('')
    .reduce((prevHash: number, currVal: string) => ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0, 0);
}

const currentId = computed(() => (props.id ?? props.url ? 'embed' + hashCode(props.url!) : undefined));

const currentUrl = ref('about:blank');
const setCurrentUrl = (url: string) => (currentUrl.value = url);
const style = computed(() => (props.heightHint ? `height: ${props.heightHint}px;` : ''));

let unwatchTheme: WatchStopHandle | undefined;

const preferencesStore = usePreferencesStore();

onMounted(() => {
  unwatchTheme = watchEffect(() => setCurrentUrl(props.themedUrl?.[preferencesStore.theme] ?? props.url!));
});

onUnmounted(() => unwatchTheme?.());
</script>

<style lang="postcss">
.infographic {
  &__content-frame {
    position: absolute;
    top: 0;
    width: 100%;
    max-width: none;
    height: 100%;
    min-height: 95px;
  }

  &__meta {
    padding: var(--grid-base--x2);
    font-size: var(--font-size-body--s0);
  }

  &__provider {
    margin-right: var(--grid-base);

    a {
      text-decoration: underline;
    }
  }

  &__content {
    position: relative;

    /* Reserve space in case height hint was not provided */
    padding-top: 75%;
  }
}
</style>
