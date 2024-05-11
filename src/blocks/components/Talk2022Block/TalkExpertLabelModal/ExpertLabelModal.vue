<template>
  <AppModal
    :close-func="props.closeFunc"
    class-modifier="expert-label"
    aria-labelledby="expert-modal__title"
    aria-describedby="expert-modal__body"
  >
    <div class="expert-modal__badge">
      <img src="./badgeverified.svg" alt="check-mark" />
    </div>
    <AppModalTitle id="expert-modal__title"> Deze NUjij-gebruiker is geverifieerd door de redactie </AppModalTitle>
    <p id="expert-modal__body" class="expert-modal__body">
      Wil jij je ook registreren als NUjij-expert? Laat ons dan weten wat jouw beroep of expertise is.
    </p>
    <a
      class="expert-modal__default-button"
      href="https://docs.google.com/forms/d/e/1FAIpQLSfslQiYYHsKik3oY4J9p2LudnidhjzuRWVieMXgh4EheQe4dg/viewform"
      target="_blank"
    >
      Meld je ook aan als expert
    </a>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from '@/components/AppModal/AppModal.vue';
import AppModalTitle from '@/components/AppModal/AppModalTitle.vue';

const props = defineProps<{
  closeFunc: () => void;
}>();
</script>

<style lang="postcss">
.expert-modal {
  &__badge {
    align-self: center;
    margin-bottom: var(--grid-base--x4);
  }

  &__body {
    align-self: center;
    margin: 0;
  }

  &__body-text {
    margin: 0 0 var(--grid-base--x4);
    font-size: var(--font-size-body--s1);
    line-height: var(--line-height-body--s1);
    color: var(--color-heading-base);
  }

  &__default-button {
    display: inline-block;
    align-self: center;
    padding: var(--grid-base--x3) var(--grid-base--x4);
    margin: var(--grid-base--x4) 0 0;
    font-size: var(--font-size-button);
    font-weight: 700;
    line-height: var(--line-height-button);
    color: var(--color-button-three);
    background-color: var(--color-button-bg-three);
    border-color: var(--color-button-bg-three);
    border-radius: var(--border-radius);

    &:hover,
    &:focus,
    &:active {
      color: var(--color-button-three);
    }
  }
}
</style>
