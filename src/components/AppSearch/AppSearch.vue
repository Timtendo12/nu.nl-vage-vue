<!-- eslint-disable vuejs-accessibility/form-control-has-label -->
<template>
  <div class="searchbar">
    <div class="search-input">
      <input
        ref="searchfield"
        v-model="query"
        type="search"
        :class="['search-input__input', { 'search-input--filled': !!query }]"
        placeholder="Zoeken op onderwerp"
        @keyup.enter="goSearch"
      />
      <app-button button-type="inline" @click="goSearch">Zoeken</app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';

import AppButton from '@/components/AppButton.vue';

const query = ref('');
const searchfield: Ref<HTMLInputElement | null> = ref(null);

const setFieldHasFocus = () => {
  searchfield.value?.focus();
};

const goSearch = (): void => {
  if (!query.value) return;
  window.location.href = `/zoeken?q=${query.value}&page=1`;
};

defineExpose({
  setFieldHasFocus,
});
</script>

<style lang="postcss">
.search-input {
  --input-top-bottom-padding: var(--grid-base);
  --input-font-size: 1rem;

  display: flex;
  gap: var(--grid-base--x2);
  width: 100%;
  padding: var(--input-top-bottom-padding) var(--grid-base--x4);
  color: var(--color-grey-four);
  background: var(--color-input-one);
  border: 1px solid transparent;
  border-radius: var(--border-radius);

  &--filled {
    color: var(--color-body-text);
  }

  &:hover {
    cursor: text;
  }

  &:focus-within {
    color: var(--color-heading-base);
    border-color: var(--color-input-two);
  }

  &__input {
    width: 100%;
    overflow: hidden;
    font-size: var(--input-font-size);
    text-overflow: ellipsis;
    appearance: none;
    background-color: var(--color-input-one);
    border: none;
    outline: none;
    transition: width 0.3s cubic-bezier(0, 1, 0.5, 1);

    &::placeholder {
      color: var(--color-grey-six);

      /* Firefox adds a lower opacity to the placeholder, so we use opacity: 1 to fix this. */
      opacity: 1;
    }

    /* Styling overrides for the webkit default clear button in type="search" */
    &::-webkit-search-cancel-button {
      appearance: none;
    }
  }
}

@media screen and (min-width: 992px) {
  .searchbar {
    padding-top: 0;
    padding-bottom: 0;
  }

  .search-input {
    --input-top-bottom-padding: 6px;
    --input-font-size: 0.8125rem;
  }
}

[data-theme='dark'] {
  .search-input {
    --color-input-one: var(--color-bg--z0);
  }
}
</style>
