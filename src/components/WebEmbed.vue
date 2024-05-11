<template>
  <!--eslint-disable-next-line vue/no-v-html-->
  <section ref="embedContainer" class="web-embed body-style body-style--s1" v-html="embedCode"></section>
</template>

<script setup lang="ts">
import { WebEmbedBlockFlavor } from 'perfapi';
import { inject, onMounted, ref, toRef, watch } from 'vue';

const props = defineProps<WebEmbedBlockFlavor>();
const embedCode = toRef(props, 'embedCode');
const embedContainer = ref<HTMLElement>();
const immediate = inject('UpdateImmediately', false);

const refreshHtml = () => {
  const el = embedContainer.value;

  if (!el || !embedCode.value) {
    return;
  }

  const range = document.createRange();
  range.selectNode(el);
  el.innerHTML = '';
  el.appendChild(range.createContextualFragment(embedCode.value));
};

onMounted(() => {
  watch(embedCode, refreshHtml, { immediate });
});
</script>

<style lang="postcss">
.web-embed {
  & iframe {
    max-width: 100%;
    border: none;
  }
}

/* There is a position top reserved by the Watchmen tv guide because of our top bar and navigation.
For in app web view there is no top bar and navigation, so we stick it to top */
.app-wrapper--in-app-view {
  .tvgm-pager__header--full-view,
  .tvgm-pager__header {
    top: 0 !important;
  }
}
</style>
