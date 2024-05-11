<!-- eslint-disable vuejs-accessibility/form-control-has-label -->
<!-- This block is used by newsQuestion -->
<template>
  <form class="form-element">
    <textarea
      class="form-element--textarea"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @input="onInput"
    ></textarea>
    <span class="form-element--counter">{{ formElementBlockTextAreaCount }}/{{ maxlength }}</span>
  </form>
</template>

<script setup lang="ts">
import { FormElementBlock } from 'perfapi';
import { computed } from 'vue';

import { useFormElementBlockStore } from '@/stores/formElement';

const formElementStore = useFormElementBlockStore();

const props = defineProps<{
  block: FormElementBlock;
}>();

const placeholder = computed(() => props.block.formElementFlavor?.placeholder);
const maxlength = computed(() => props.block.formElementFlavor?.maxlength);
const formElementBlockTextAreaCount = computed(() => formElementStore.formElementBlockTextArea.length);

const onInput = (payload: Event) => {
  const target = payload.target as HTMLInputElement;
  formElementStore.setFormElementBlockTextArea(target.value);
};
</script>

<style lang="postcss">
.form-element {
  min-width: 100%;
}

.form-element--textarea {
  min-width: 100%;
  min-height: 80px;
  padding: var(--grid-base--x2) var(--grid-base--x4);
  border: 1px solid var(--color-grey-two);
  border-radius: var(--grid-base--x2);
}

.form-element--counter {
  display: flex;
  flex-direction: row-reverse;
  font-size: var(--font-size-subline--s0);
}

[data-theme='dark'] {
  .form-element--textarea {
    color: var(--color-grey-one);
    background-color: var(--color-darkgrey-one);
  }
}
</style>
