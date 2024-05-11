<template>
  <h2 class="modal-title">
    <slot></slot>
  </h2>
</template>

<style lang="postcss">
.modal-title {
  align-self: center;
  margin: 0 0 var(--grid-base--x4);
  font-size: var(--font-size-pop-up-header);
  line-height: var(--line-height-pop-up-header);
}
</style>
