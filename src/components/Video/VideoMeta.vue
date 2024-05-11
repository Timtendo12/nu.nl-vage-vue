<template>
  <section class="video-meta">
    <h1 class="video-meta__title">{{ title?.text }}</h1>
    <p v-if="publishedAt" class="video-meta__published-at body-style body-style--s0">
      <span>Gepubliceerd op</span> {{ publishedAt }}
    </p>
    <p v-if="caption" class="video-meta__description body-style body-style--s0">
      {{ caption }}
    </p>
    <talk-2022-button v-if="nujij?.enabled" :count="nujij.count" data-label="next-to-video" />
  </section>
</template>

<script setup lang="ts">
import { StyledText } from 'perfapi';
import { computed } from 'vue';

import Talk2022Button from '@/blocks/components/Talk2022Block/Talk2022Button.vue';
import { NujijState } from '@/stores/nujij';

const props = defineProps<{
  caption?: string;
  createdAt?: string;
  title?: StyledText;
  nujij?: NujijState;
}>();

const publishedAt = computed(() => {
  if (!props.createdAt) return;
  const date = new Date(Date.parse(props.createdAt));
  return date.toLocaleString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Amsterdam',
  });
});
</script>

<style lang="postcss">
.video-meta {
  &__info {
    margin: 0 0 var(--grid-base--x4) var(--grid-base--x4);
  }

  &__title {
    margin: 0 0 0.625rem;
    font-size: 1.125rem;
    font-weight: 400;
    line-height: calc(20 / 18);
  }

  &__description,
  &__published-at {
    font-weight: var(--font-style-weight);
    line-height: var(--font-style-height);
  }

  &__published-at {
    display: block;
    font-size: 0.75rem;
    color: var(--color-light-blue-two);

    span {
      display: none;
    }
  }
}

@media screen and (min-width: 600px) {
  .video-meta {
    &__published-at {
      span {
        display: inline-block;
      }
    }
  }
}
</style>
