<template>
  <pop-out :enable-popout="loggedin" class="nav-tools__tool">
    <template #trigger>
      <app-button
        button-type="cta"
        :class="{ loggedin }"
        class="account-trigger"
        data-nosnippet
        @click.prevent="accountTriggerClicked"
      >
        <AppIcon
          v-if="loggedin && user"
          embed
          class="account-trigger__icon"
          :embed-alt="'Profiel van ' + user.firstName"
        >
          <IconUser />
        </AppIcon>
        <AppIcon v-else embed embed-alt="Inloggen" class="account-trigger__icon">
          <IconUser />
        </AppIcon>
        <span v-if="loggedin && user" class="nav-tools__tool__label account-trigger__username" aria-hidden="true">
          {{ user.firstName || 'Mijn account' }}
        </span>
        <a v-else class="nav-tools__tool__label" aria-hidden="true" @click.prevent="login"> Inloggen </a>
        <AppIcon v-if="loggedin" embed width="16" height="16" aria-hidden="true">
          <IconCaretDown />
        </AppIcon>
      </app-button>
    </template>
    <template #content>
      <button class="account-trigger__link states states--hover" @click.stop="showProfile">Account</button>
      <button class="account-trigger__link states states--hover" @click.stop="logout">Uitloggen</button>
    </template>
  </pop-out>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import AppButton from '@/components/AppButton.vue';
import AppIcon from '@/components/AppIcon.vue';
import IconCaretDown from '@/components/icons/IconCaretDown.vue';
import IconUser from '@/components/icons/IconUser.vue';
import PopOut from '@/components/PopOut/PopOut.vue';
import { PipUser } from '@/stores/user';
import { login as innerLogin, logout, showProfile } from '@/utils/auth';

const props = defineProps<{ user?: PipUser }>();

const loggedin = computed(() => !!props.user);
const login = () => {
  innerLogin({ dpg_medium: 'menu', dpg_campaign: 'menu' });
};

const accountTriggerClicked = () => {
  if (!loggedin.value) login();
};
</script>

<style lang="postcss">
.account-trigger {
  position: relative;
  padding: 0;

  &__icon {
    position: relative;

    &::after {
      position: absolute;
      right: 0;
      bottom: 0;
      display: inline-block;
      width: 0.5625rem;
      aspect-ratio: 1/1;
      line-height: 0;
      content: '';
      background-image: url("data:image/svg+xml,<svg height='9' width='9' xmlns='http://www.w3.org/2000/svg'><g transform='translate(-19 -18)'><circle cx='23.5' cy='22.5' r='4.5' fill='#e88327'/><path fill-rule='evenodd' clip-rule='evenodd' d='M25.354 20.646a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0z' fill='#fff'/><path fill-rule='evenodd' clip-rule='evenodd' d='M21.646 20.646a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0z' fill='#fff'/></g></svg>");
      background-repeat: no-repeat;
    }
  }

  &.loggedin {
    .account-trigger__icon {
      &::after {
        content: '';
        background-image: url("data:image/svg+xml,<svg height='9' width='9' xmlns='http://www.w3.org/2000/svg'><g transform='scale(1.33333)'><circle cx='3.375' cy='3.375' r='3.375' fill='#69a10e' style='stroke-width:.75'/><path fill-rule='evenodd' clip-rule='evenodd' d='M5.14 2.36a.375.375 0 0 1 0 .53L3.267 4.767a.375.375 0 0 1-.531-.531L4.61 2.36a.375.375 0 0 1 .53 0z' fill='#fff' style='stroke-width:.75'/><path fill-rule='evenodd' clip-rule='evenodd' d='M1.61 3.11a.375.375 0 0 0 0 .53l1.124 1.126a.375.375 0 0 0 .531-.531L2.14 3.11a.375.375 0 0 0-.53 0z' fill='#fff' style='stroke-width:.75'/></g></svg>");
      }
    }
  }

  &__username {
    max-width: 3.125rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__link {
    cursor: pointer;
    background-color: var(--color-bg--z0);
    border-top: 1px solid var(--color-border--z0);
    border-right: 0;
    border-bottom: 0;
    border-left: 0;

    &:first-child {
      border-top: 0;
    }
  }
}
</style>
