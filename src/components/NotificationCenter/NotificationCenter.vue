<template>
  <pop-out
    v-if="loggedIn"
    class="nav-tools__tool notification-center"
    :enable-popout="!!notificationLength"
    scrollable
    full-width-on-mobile
    trigger-on="click"
    @content-show="trackOpen"
    @content-hide="markAllAsRead"
  >
    <template #trigger>
      <app-button class="notification-center__trigger" :v-show="loggedIn" button-type="cta" :disabled="!loggedIn">
        <app-icon
          embed
          :embed-alt="`${unreadNotificationLength} ongelezen notificaties`"
          class="notification-trigger__icon icon--24"
        >
          <icon-bell />
        </app-icon>
        <span v-if="showUnreadNotificationsBadge" class="notification-center__count">{{
          unreadNotificationsBadge
        }}</span>
      </app-button>
    </template>
    <template #content>
      <link-template-notification v-for="item in sortedNotificationLinks" :key="item.id" :link="item.link" />
    </template>
  </pop-out>
</template>

<script setup lang="ts">
import { UrlTarget } from 'perfapi';
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';

import AppButton from '@/components/AppButton.vue';
import AppIcon from '@/components/AppIcon.vue';
import IconBell from '@/components/icons/IconBell.vue';
import PopOut from '@/components/PopOut/PopOut.vue';
import { PipUser } from '@/stores/user';
import { getEnvVariable } from '@/utils/config';
import { humanizeDatetimeToCET } from '@/utils/date';
import { useGtm } from '@/utils/gtm';

import LinkTemplateNotification from './notification.vue';
import { connect, disconnect, markAllAsRead, notifications, unreadNotifications } from './NotificationData';

const notificationsBadgeLimit = parseInt(getEnvVariable('VITE_NOTIFICATIONS_BADGE_LIMIT', '9'), 10);
const gtm = useGtm();
const props = defineProps<{ user?: PipUser }>();
const loggedIn = computed(() => !!props.user);

const notificationLength = computed<number>(() => Object.keys(notifications.value).length);
const unreadNotificationLength = computed<number>(() => Object.keys(unreadNotifications.value).length);
const showUnreadNotificationsBadge = computed<boolean>(() => !!unreadNotificationLength.value);
const unreadNotificationsBadge = computed<string>(() =>
  unreadNotificationLength.value > notificationsBadgeLimit
    ? `${notificationsBadgeLimit}+`
    : `${unreadNotificationLength.value}`,
);

const sortedNotificationLinks = computed(() =>
  Object.values(notifications.value)
    .sort((a, b) => (a.updated_at.seconds > b.updated_at.seconds ? -1 : 1))
    .map((item) => ({
      id: item.generated_id,
      link: {
        target: {
          __typename: 'UrlTarget',
          url: item.context.url,
        } as UrlTarget,
        linkFlavor: {
          icon: getIcon(item.type),
          title: item.context.title,
          body: item.context.message,
          timestamp: humanizeDatetimeToCET(new Date(item.updated_at.seconds * 1000)),
          is_read: item.is_read,
        },
      },
    })),
);

onMounted(async () => {
  if (props.user) {
    const unWatchNotificationLength = watch(notificationLength, (updatedNotificationLength) => {
      if (updatedNotificationLength > 0) {
        gtm.add({
          event: 'notification-center',
          notifications: unreadNotificationLength.value,
        });
        unWatchNotificationLength();
      }
    });
    await connect(props.user);
  }
  watch(loggedIn, () => disconnect());
});

onBeforeUnmount(() => disconnect());

function getIcon(type: string) {
  const iconmap: Record<string, string> = {
    talk_respects: 'icon-thumbs-up',
    talk_replies: 'icon-comment',
    talk_highlight: 'icon-pin-outline',
    info_link: 'icon-info',
  };

  if (iconmap[type]) {
    return iconmap[type];
  } else {
    return '';
  }
}

const trackOpen = () => {
  gtm.add({
    event: 'notification-center',
    action: 'open',
    label: unreadNotificationLength.value,
  });
};
</script>

<style lang="postcss">
.notification-center {
  display: flex;
  padding: 0;

  &__trigger {
    position: relative;
    padding: 0;
  }

  &__count {
    position: absolute;
    top: var(--grid-base--x2);
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    justify-items: center;
    width: 1rem;
    aspect-ratio: 1/1;
    font-size: 0.5625rem;
    font-weight: 700;
    color: var(--color-white-one);
    background-color: var(--color-red-one);
    border: 1px solid var(--color-border--z0);
    border-radius: 50%;
    transform: translateX(30%);
  }

  .link-block--notification {
    border-color: var(--color-border--z0);
    border-style: solid;
    border-width: 0 0 1px;

    &:last-child {
      border-bottom-width: 0;
    }
  }
}
</style>
