<template>
  <a
    v-if="!inFallbackMode"
    class="app-button app-button--inversed app-button--nowrap branded comments-link"
    href="#nujij"
    data-category="nujij"
    data-action="go-to-reactions"
    :data-label="dataLabel"
  >
    <AppIcon embed embed-alt="Reacties op dit nieuwsbericht" class="comments-link__icon" width="15" height="15">
      <IconComment />
    </AppIcon>
    <span>
      {{ formattedCount }}
      {{ postLabel }}
    </span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import IconComment from '@/components/icons/IconComment.vue';
import { useContextStore } from '@/stores/context';

const props = defineProps<{
  count?: number;
  position?: string;
}>();

const { inFallbackMode } = useContextStore();

const formattedCount = computed(() => {
  const value = props.count;
  if (value === undefined) return '';
  if (value < 1000) {
    return value.toString();
  } else if (value < 1000 * 1000) {
    return `${(value / 1000).toFixed(1).replace('.0', '')}K`;
  } else {
    return `${(value / (1000 * 1000)).toFixed(1).replace('.0', '')}M`;
  }
});
const postLabel = computed(() => (props.count && props.count === 1 ? ' reactie' : ' reacties'));
const dataLabel = computed(() => `via-article_${props.position}`);
</script>
