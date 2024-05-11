<template>
  <Transition name="modal-">
    <div
      v-if="showModal"
      ref="modal"
      :class="`modal modal--${classModifier}`"
      aria-modal="true"
      v-bind="gtmCloseAttributes"
      role="button"
      tabindex="0"
      @click.self="closeModal"
      @keydown.escape="closeModal"
    >
      <div class="modal__container">
        <div class="modal__body">
          <slot></slot>
        </div>
        <button class="modal__close-button" aria-label="sluit venster" v-bind="gtmCloseAttributes" @click="closeModal">
          <AppIcon width="16" height="16" embed>
            <IconClose />
          </AppIcon>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { GTMLinkAttributes } from 'perfapi';
import { computed, ref } from 'vue';

import { createDataLinkAttributes } from '@/utils/gtm';

import AppIcon from '../AppIcon.vue';
import IconClose from '../icons/IconClose.vue';
import { useModalLayer } from './AppModalLayer.vue';

const modal = ref<Element>();
useModalLayer(modal);

const showModal = ref(true);

const props = defineProps<{
  classModifier: string;
  closeFunc: () => void;
  closeGtmAttributes?: GTMLinkAttributes;
}>();

const gtmCloseAttributes = computed(
  () => props.closeGtmAttributes && createDataLinkAttributes(props.closeGtmAttributes),
);

const closeModal = (): void => {
  showModal.value = false;
  props.closeFunc();
};
</script>

<style lang="postcss">
.modal {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: all 0.18s ease;

  &--enter-from {
    opacity: 0;
  }

  &--leave-to {
    opacity: 0;
  }

  &__container {
    display: flex;
    flex-direction: column-reverse;
    max-width: calc(100vw - 2 * var(--grid-base--x4));
    max-height: calc(100vh - 2 * var(--grid-base--x4));
    padding: 2rem;
    margin: --grid-base--x4;
    overflow: auto;
    font-size: var(--font-size-body--s1);
    line-height: var(--line-height-body--s1);
    color: var(--color-heading-base);
    text-align: center;
    background-color: var(--color-bg--z0);
    border-radius: var(--border-radius--three-quarters);
    box-shadow: 0 0.2rem 0.8rem var(--color-modal-mask-shadow);
  }

  &--enter-from .modal__container,
  &--leave-to .modal__container {
    transform: scale(1.03);
  }

  &__header {
    align-self: center;
    margin: 0 0 1rem;
    font-size: 1.125rem;
  }

  &__close-button {
    align-self: flex-end;
    padding: 0;
    margin: calc(var(--grid-base--x3) * -1);
    margin-bottom: var(--grid-base--x3);
    line-height: 0;
    color: var(--color-grey-four);
    background-color: transparent;
    border: none;
    transition: all 0.13s ease;

    &:focus,
    &:hover {
      color: var(--brand-color);
      transform: scale(1.02);
    }

    &:focus-visible {
      position: relative;

      &::after {
        position: absolute;
        top: -0.25rem;
        left: -0.25rem;
        z-index: 30;
        width: 1.5rem;
        aspect-ratio: 1/1;
        content: '';
        box-shadow: inset 0 0 0 2px currentcolor;
      }
    }
  }
}

.modal--breaking-push {
  .modal__container {
    width: 37.5rem;
  }
}

.modal--expert-label {
  .modal__container {
    width: 35rem;
  }
}

@media (--larger-than-most-phones) {
  .modal__close-button {
    margin: 0;
  }
}
</style>
