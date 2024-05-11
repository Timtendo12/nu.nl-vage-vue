<template>
  <app-target-link
    v-if="link?.target"
    :target="link?.target"
    :class="classList"
    data-category="notification-center"
    data-action="click-notification"
    :data-label="link.linkFlavor?.title"
  >
    <div class="link-block__icon">
      <app-icon v-if="link.linkFlavor?.icon" embed embed-alt="notificatie icoon">
        <component :is="link.linkFlavor?.icon" />
      </app-icon>
    </div>
    <div class="link-block__message">
      <h3 v-if="link.linkFlavor?.title" class="link-block__title">
        {{ link.linkFlavor.title }}
      </h3>
      <div v-if="link.linkFlavor?.body" class="link-block__body">
        {{ link.linkFlavor.body }}
      </div>
      <time v-if="link.linkFlavor?.timestamp" class="link-block__timestamp">
        {{ link.linkFlavor.timestamp }}
      </time>
    </div>
  </app-target-link>
</template>

<script setup lang="ts">
import { UrlTarget } from 'perfapi';
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';

const props = defineProps<{
  link?: {
    target?: UrlTarget;
    linkFlavor?: {
      icon?: string;
      title?: string;
      body?: string;
      timestamp?: string;
      is_read?: boolean;
    };
  };
}>();

const classList = computed(() => [
  'link-block',
  'link-block--notification',
  'states',
  'states--hover',
  props.link?.linkFlavor?.is_read ? 'link-block--read' : 'link-block--unread',
]);
</script>

<style lang="postcss">
.link-block--notification {
  display: flex;
  gap: var(--grid-base--x4);
  background-color: var(--color-bg--z0);

  .link-block {
    &__title {
      padding: 0;
      margin: 0;
      font-size: 0.875rem;
    }

    &__message {
      display: flex;
      flex-flow: column nowrap;
      gap: var(--grid-base--x2);
    }

    &__body {
      /* stylelint-disable value-no-vendor-prefix */
      display: -webkit-box;
      max-height: 3.9em;
      /* stylelint-enable */
      overflow: hidden;
      line-height: 1.3;
      text-overflow: ellipsis;
      overflow-wrap: break-word;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    &__timestamp {
      display: flex;
      flex-wrap: nowrap;
      gap: var(--grid-base--x2);
      align-items: baseline;
      color: var(--color-caption-one);
    }
  }

  &.link-block--unread {
    .link-block__timestamp::before {
      display: inline-block;
      flex: 0 0 auto;
      width: 0.5625rem;
      aspect-ratio: 1/1;
      content: '';
      background-color: var(--color-red-one);
      border-radius: 50%;
    }
  }
}
</style>
