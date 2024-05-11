<template>
  <div class="app-follow-us" data-nosnippet>
    <h4 class="app-follow-us__title">Volg ons op:</h4>
    <ul class="app-follow-us__badges">
      <li v-if="instagram" class="instagram">
        <a href="https://www.instagram.com/nu.nl/" target="_blank">
          <AppIcon embed>
            <IconInstagram />
          </AppIcon>
          <span class="visually-hidden">Volg ons op Instagram</span>
        </a>
      </li>
      <li v-if="facebook" class="facebook">
        <a href="https://www.facebook.com/NUnl" target="_blank">
          <AppIcon embed>
            <IconFacebook />
          </AppIcon>
          <span class="visually-hidden">Volg ons op Facebook</span>
        </a>
      </li>
      <li v-if="twitter" class="twitter">
        <a href="https://www.twitter.com/NUnl" target="_blank">
          <AppIcon embed>
            <IconX />
          </AppIcon>
          <span class="visually-hidden">Volg ons op X</span>
        </a>
      </li>
      <li v-if="rss" class="rss">
        <a href="/rss" target="_blank">
          <AppIcon embed>
            <IconRSS />
          </AppIcon>
          <span class="visually-hidden">RSS Feed</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import AppIcon from './AppIcon.vue';
import { IconFacebook, IconInstagram, IconRSS, IconX } from './icons';

export default defineComponent({
  name: 'AppFollowUs',
  components: {
    AppIcon,
    IconFacebook,
    IconInstagram,
    IconRSS,
    IconX,
  },
  props: {
    instagram: {
      type: Boolean,
      default: false,
    },
    facebook: {
      type: Boolean,
      default: false,
    },
    twitter: {
      type: Boolean,
      default: false,
    },
    rss: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="postcss">
.app-follow-us {
  display: flex;
  align-items: center;

  &__title {
    margin: 0;
  }

  &__badges {
    display: flex;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      margin-left: var(--grid-base--x2);

      a {
        display: inline-flex;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: var(--grid-base);
        font-size: 0.875rem;
        color: var(--color-white-one);
        background-color: var(--color-red-one);
        border-radius: 50%;
      }

      .icon {
        width: 1em;
        height: 1em;
      }
    }
  }
}
</style>
