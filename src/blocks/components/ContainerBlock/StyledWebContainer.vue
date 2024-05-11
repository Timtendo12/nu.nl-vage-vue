<template>
  <component :is="tag" v-if="!hideOnFallback" ref="containerRef" :class="cssClassList" v-bind="attributes">
    <BlockResolver v-for="block in blocks" :key="block.id" :block="block" />
  </component>
</template>

<script setup lang="ts">
import { Block, StyledWebContainer, StyledWebContainerAttribute } from 'perfapi';
import { computed, ref } from 'vue';

import BlockResolver from '@/blocks/BlockResolver.vue';
import { useWhenFullyInView, useWhenPartlyInView } from '@/composables/in-view/use-when-in-view';
import { useContextStore } from '@/stores/context';
import { useGtm } from '@/utils/gtm';

const props = defineProps<{
  blocks: Block[];
  flavor: StyledWebContainer;
}>();

const tag = computed(() => props.flavor?.tag || 'div');

const cssFlavorClass = computed(() => props.flavor?.cssClass || 'container');
const cssClassList = computed(() => `blocks-container-${cssFlavorClass.value} ${cssFlavorClass.value}`);

const disabledContainersOnFallback = ['followtag', 'qa-block', 'featured-comments'];
const contextStore = useContextStore();

const hideOnFallback = computed(
  () =>
    contextStore.inFallbackMode && disabledContainersOnFallback.some((cssClass) => cssFlavorClass.value === cssClass),
);

const attributes = computed(() => {
  if (!props.flavor.attributes) {
    return {};
  }
  return props.flavor.attributes.reduce((prev: Record<string, string>, curr: StyledWebContainerAttribute) => {
    prev[curr.key] = curr.value;
    return prev;
  }, {});
});

const containerRef = ref<Element>();

if (props.flavor?.cssClass === 'login-wall') {
  const gtm = useGtm();
  useWhenPartlyInView({
    target: containerRef,
    threshold: 0.5,
    callback: () => gtm.add({ event: 'loginwall-in-view' }),
  });
}
if (props.flavor?.cssClass === 'featured-comments') {
  const gtm = useGtm();
  useWhenPartlyInView({
    target: containerRef,
    threshold: 0.5,
    callback: () => gtm.add({ event: 'nujij-comment-in-view' }),
  });
}
if (props.flavor?.cssClass === 'linked-tags') {
  const gtm = useGtm();
  useWhenFullyInView({ target: containerRef, callback: () => gtm.add({ event: 'tags-in-view' }) });
}
</script>

<style lang="postcss">
.horizontal-direction {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.horizontal-spread {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.horizontal-stacked {
  display: flex;
  flex-flow: row wrap;
  gap: var(--grid-base--x2) var(--grid-base--x4);
  justify-content: flex-start;
}

.article {
  --column-area: stretched;

  > * {
    --column-area: padded;

    flex-wrap: wrap;
  }
}

.linked-tags {
  display: flex;
  flex-flow: row wrap;
  gap: var(--grid-base--x4);
  align-items: center;
  margin: 0;
}

.vertical-direction {
  display: flex;
  flex-direction: column;
}

.contextual,
.summary {
  padding: var(--grid-base--x4);
  margin: 0;
  overflow: hidden;
  border: 2px solid var(--color-border--z0);
  border-radius: var(--border-radius);
}

.contextual {
  --contextual-bg-color: hsla(var(--brand-color-raw) / 1%);
  --contextual-border-color: hsla(var(--brand-color-raw) / 10%);

  background-color: var(--contextual-bg-color);
  border-color: var(--contextual-border-color);
}

@media (prefers-contrast: more) {
  .contextual {
    --contextual-border-color: var(--brand-color-one);
  }
}

.byline {
  display: flex;
  gap: var(--grid-base--x4);
  align-items: center;
  margin-right: 0;

  .textblock {
    padding: 0;
  }

  img {
    width: 2.5rem;
    aspect-ratio: 1/1;
    border: 2px solid var(--color-grey-two);
    border-radius: 50%;
  }
}

.followtag {
  padding: var(--grid-base--x4);
  border: 2px solid var(--color-border--z0);
  border-radius: var(--border-radius);

  .header-block__header {
    margin-bottom: var(--block-spacing);
    font-size: var(--font-size-body--s1);
    font-weight: var(--font-weight-semi-bold);
    line-height: var(--line-height-body--s1);
  }

  > span {
    display: block;
    margin-bottom: var(--block-spacing);
  }
}

.login-wall,
.featured-comments {
  display: flex;
  flex-direction: column;
  gap: var(--block-spacing);
}

.login-wall {
  --box-shadow-offset: 3px;

  position: relative;
  padding: var(--grid-base--x4);
  margin: 0 var(--box-shadow-offset) 0 0;
  overflow: visible !important;
  text-align: center;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);

  &::before {
    position: absolute;
    top: calc(var(--box-shadow-offset) * -1);
    display: block;
    width: 100%;
    height: 100px;
    margin-left: calc(var(--container-gutter-left) * -1);
    content: '';
    background: linear-gradient(180deg, transparent, var(--color-bg--z0));
    transform: translate(calc(var(--grid-base--x4) * -1), -100%);
  }
}

.qa-block {
  display: flex;
  flex-direction: column;
  gap: var(--grid-base--x4);
  align-items: start;
  padding: var(--grid-base--x4);
  border: 2px solid var(--color-grey-two);
  border-radius: var(--border-radius);
}

.qa-block-login-wall {
  display: flex;
  flex-direction: column;
  gap: var(--block-spacing);
  padding: var(--grid-base--x4);
  margin: 0 var(--box-shadow-offset) 0 0;
  text-align: left;
  border: 2px solid var(--color-grey-two);
  border-radius: var(--border-radius);
}

.qa-block-login-wall-buttons {
  display: flex;
  flex-direction: row;
  gap: var(--block-spacing);
}

.authorized-content {
  display: none;
}

.hidden,
.blocks-container-hidden.hidden {
  display: none;
}

.advertorial-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg--z2);

  span {
    margin-left: var(--grid-base--x3);
    font-size: 0.875rem;
    color: var(--color-grey-six);
  }

  img {
    max-height: 2.5rem;
    padding: var(--grid-base);
  }
}

.topbar {
  margin-bottom: var(--grid-base--x4);
  color: var(--color-heading-base);

  &__date {
    display: none;
    flex: 0 1 37.5rem;
    align-items: center;
    font-size: var(--font-size-subline--s0);

    h1 {
      margin-left: var(--grid-base);
      font-size: var(--font-size-heading--s0);
      font-weight: var(--font-weight-primary-regular);
    }
  }
}

.app-wrapper--in-app-view {
  .topbar {
    display: none;
  }
}

@media (--two-columns-fit) {
  .topbar {
    &__date {
      display: flex;
    }
  }
}

[data-theme='dark'] {
  .contextual {
    --contextual-bg-color: var(--color-bg--z1);
    --contextual-border-color: var(--color-bg--z2);
  }
}
</style>
