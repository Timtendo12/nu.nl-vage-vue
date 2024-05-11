<template>
  <div ref="container" class="modal-layer">
    <div v-show="isLayerVisible" ref="stack" class="modal-layer__stack" content="nosnippet" role="dialog">
      <div ref="shade" class="modal-layer__shade"></div>
    </div>
    <div ref="scroll" class="modal-layer__page-behind" :aria-hidden="isLayerVisible">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { inject, InjectionKey, onMounted, provide, Ref, ref } from 'vue';

import { getFocusableElements, isTabPressed } from '@/utils/keyboard';

const injectionKey: InjectionKey<{ addElement: (ref: Ref) => void }> = Symbol('injectionKey');

type LayerData = {
  addElement: (el: Ref<Element | undefined>) => void;
};

export const useModalLayer = (elementRef: Ref<Element | undefined>) => {
  const injectionElement = inject(injectionKey);
  onMounted(() => injectionElement?.addElement(elementRef));
  return { toFront: () => injectionElement?.addElement(elementRef) };
};
</script>

<script setup lang="ts">
const stack = ref<Element>();
const shade = ref<Element>();
const scroll = ref<HTMLElement>();
const container = ref<HTMLElement>();
const storedFocus = ref<HTMLElement>();
const isLayerVisible = ref(false);
let releaseFocus: () => void;

const sortOrHide = () => {
  const stackLayer = stack.value;
  const shadeLayer = shade.value;

  if (stackLayer && shadeLayer) {
    stackLayer.appendChild(shadeLayer);
    const top = Array.from(stackLayer.children)
      .reverse()
      .find((element) => element !== shadeLayer) as HTMLElement;

    if (releaseFocus) {
      releaseFocus();
    }

    if (top) {
      if (!isLayerVisible.value) {
        storedFocus.value = (document.activeElement as HTMLElement) || undefined;
      }
      stackLayer.appendChild(top);
      showLayer();
      releaseFocus = trapFocus(top);
    } else {
      hideLayer();
      storedFocus.value?.focus();
    }
  }
};

let scrollLock = 0;

// based on https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
const trapFocus = (modal: HTMLElement) => {
  const focusableContent = getFocusableElements(modal);
  const firstFocusableElement = focusableContent[0]; // get first element to be focused inside modal
  const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

  const isCurrentFocusInsideModal = () => {
    const focusedElement = document.activeElement;
    if (focusedElement === null) {
      return false;
    }
    return modal.contains(focusedElement);
  };

  const loopFocus = (e: KeyboardEvent) => {
    if (!isTabPressed(e)) {
      return;
    }

    if (!isCurrentFocusInsideModal()) {
      // if focus is outside modal, return it to first focusable element
      firstFocusableElement.focus();
      e.preventDefault();
    } else if (e.shiftKey) {
      // if shift key pressed for shift + tab combination
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus(); // add focus for the last focusable element
        e.preventDefault();
      }
    } else {
      // if tab key is pressed
      if (document.activeElement === lastFocusableElement) {
        // if focused has reached to last focusable element then focus first focusable element after pressing tab
        firstFocusableElement.focus(); // add focus for the first focusable element
        e.preventDefault();
      }
    }
  };

  document.addEventListener('keydown', loopFocus);

  lastFocusableElement.focus();
  return () => document.removeEventListener('keydown', loopFocus);
};

const killScroll = () => {
  if (scroll.value) {
    scrollLock = window.scrollY;
    container.value?.classList.add('modal-layer--noscroll');
    scroll.value.style.marginTop = `-${scrollLock}px`;
  }
};

const enableScroll = () => {
  if (scroll.value) {
    container.value?.classList.remove('modal-layer--noscroll');
    scroll.value.style.removeProperty('margin-top');
    if (scrollLock > 0) window.scrollTo({ top: scrollLock, left: 0 });
  }
};

const showLayer = () => {
  isLayerVisible.value = true;
  killScroll();
};

const hideLayer = () => {
  isLayerVisible.value = false;
  enableScroll();
};

const addElement = (elementRef: Ref<Element | undefined>) => {
  if (elementRef.value && stack.value) {
    stack.value.appendChild(elementRef.value);
  }
};

const layerData: LayerData = { addElement };
provide(injectionKey, layerData);

onMounted(() => {
  const mutationCallback: MutationCallback = (_, observer) => {
    if (stack.value) {
      observer.disconnect();
      sortOrHide();
      observer.observe(stack.value, { childList: true });
    }
  };
  const observer = new MutationObserver(mutationCallback);
  mutationCallback([], observer);
});
</script>

<style lang="postcss">
.modal-layer {
  &--noscroll {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow-y: hidden;
  }

  &__stack {
    position: fixed;
    top: 0;
    z-index: 2000000002;
    width: 100%;
    height: 100%;
  }

  &__shade {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(0 0 0 / 30%);
    background-color: var(--color-modal-mask-bg);
    opacity: 1;
    transition: opacity 0.3s ease;
  }
}
</style>
