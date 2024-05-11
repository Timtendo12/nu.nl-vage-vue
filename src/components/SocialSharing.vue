<template>
  <div ref="socialSharing" :class="`social-sharing social-sharing--${position}`">
    <pop-out :position="popupPosition">
      <template #trigger>
        <app-button button-type="inversed" class="social-sharing__button" brand="inherit">
          <app-icon embed class="icon--share" width="15" height="15" embed-alt="Deel dit nieuwsbericht">
            <icon-share />
          </app-icon>
          <span aria-hidden="true">Delen</span>
        </app-button>
      </template>

      <template #content>
        <a
          v-for="platform in platforms"
          :key="platform.id"
          :href="platform.url"
          data-category="article"
          data-action="share"
          :data-label="`${platform.name}_${position}`"
          class="social-sharing__link states states--hover"
        >
          <span class="sr-only">Delen via {{ platform.friendlyName }}</span>
          <app-icon
            embed
            :class="`icon--${platform.name}`"
            width="20"
            height="20"
            :embed-alt="`Delen via ${platform.friendlyName}`"
          >
            <component :is="platform.icon" />
          </app-icon>
          <span>{{ platform.friendlyName }}</span>
        </a>
      </template>
    </pop-out>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import AppButton from '@/components/AppButton.vue';
import AppIcon from '@/components/AppIcon.vue';
import IconEnvelope from '@/components/icons/IconEnvelope.vue';
import IconFacebook from '@/components/icons/IconFacebook.vue';
import IconLinkedin from '@/components/icons/IconLinkedin.vue';
import IconShare from '@/components/icons/IconShare.vue';
import IconWhatsapp from '@/components/icons/IconWhatsapp.vue';
import IconX from '@/components/icons/IconX.vue';
import PopOut from '@/components/PopOut/PopOut.vue';
import { useWhenInView } from '@/composables/in-view/use-when-in-view';
import { useContentStore } from '@/stores/content';
import { useGtm } from '@/utils/gtm';

const props = defineProps<{
  position?: string;
}>();

const contentStore = useContentStore();
let gtm = useGtm();

const socialSharing = ref<Element>();

useWhenInView({ target: socialSharing, callback: () => gtm.add({ event: 'share-in-view', position: props.position }) });

const cleanTitle = computed(() => contentStore.screenTitle.split(' |', 1).join());

const platforms = [
  {
    id: 0,
    name: 'whatsapp',
    friendlyName: 'WhatsApp',
    icon: IconWhatsapp,
    url: `//api.whatsapp.com/send?text=Bekijk+dit+artikel+op+NU.nl%3A+${contentStore.screenCanonicalUrl}`,
  },
  {
    id: 1,
    name: 'facebook',
    friendlyName: 'Facebook',
    icon: IconFacebook,
    url: `//www.facebook.com/sharer.php?u=${contentStore.screenCanonicalUrl}`,
  },
  {
    id: 2,
    name: 'X',
    friendlyName: 'X',
    icon: IconX,
    url: `//twitter.com/intent/tweet/?text=${cleanTitle.value}&url=${contentStore.screenCanonicalUrl}&via=NUnl`,
  },
  {
    id: 3,
    name: 'linkedin',
    friendlyName: 'LinkedIn',
    icon: IconLinkedin,
    url: `//www.linkedin.com/shareArticle?url=${contentStore.screenCanonicalUrl}`,
  },
  {
    id: 4,
    name: 'email',
    friendlyName: 'E-mail',
    icon: IconEnvelope,
    url: `mailto:?subject=${cleanTitle.value}&body=${contentStore.screenCanonicalUrl}`,
  },
];

const popupPosition = props.position === 'top' ? 'bottom' : 'top';
</script>

<style lang="postcss">
.social-sharing {
  position: relative;
  display: flex;
  gap: var(--grid-base--x2);

  .social-sharing {
    &__button {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__link {
    display: flex;
    flex-flow: row nowrap;
    gap: var(--grid-base--x4);
    padding: var(--grid-base--x2) var(--grid-base--x4);
    background-color: var(--color-bg--z0);
  }

  .icon {
    display: inline-flex;

    &--whatsapp {
      color: #00bd6f;
    }

    &--facebook {
      color: #4c66a4;
    }

    &--twitter {
      color: #00a0d1;
    }

    &--linkedin {
      color: #0082b9;
    }

    &--envelope {
      color: #c40000;
    }
  }

  &:hover {
    .social-sharing {
      &__button {
        z-index: 20;
      }
    }
  }
}
</style>
