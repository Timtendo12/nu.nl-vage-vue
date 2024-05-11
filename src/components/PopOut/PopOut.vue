<template>
  <div
    ref="target"
    :class="classList"
    v-on="triggerOn === 'hover' ? { mouseenter: show, mouseleave: hideWithDelay } : { click: toggleShow }"
  >
    <div class="pop-out__trigger">
      <slot name="trigger"></slot>
    </div>
    <div v-if="enablePopout" ref="content" class="pop-out__content">
      <div class="pop-out__scroll">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const emit = defineEmits(['contentShow', 'contentHide']);
const target = ref();
const content = ref();

const props = withDefaults(
  defineProps<{
    position?: string;
    enablePopout?: boolean;
    scrollable?: boolean;
    fullWidthOnMobile?: boolean;
    triggerOn?: string;
  }>(),
  {
    position: 'bottom',
    enablePopout: true,
    scrollable: false,
    fullWidthOnMobile: false,
    triggerOn: 'hover',
  },
);

const showContent = ref(false);
const isOverflowing = ref(false);

const classList = computed(() => [
  'pop-out',
  props.position == 'top' ? 'pop-out--pop-up' : 'pop-out--pop-down',
  props.triggerOn == 'click' ? 'pop-out--trigger-click' : 'pop-out--trigger-hover',
  props.scrollable ? 'pop-out--scrollable' : null,
  props.fullWidthOnMobile ? 'pop-out--allow-fw' : null,
  showContent.value ? 'pop-out--show-content' : null,
  isOverflowing.value ? 'pop-out--overflowing' : null,
]);

let hideTimer: number | undefined;

const hideWithDelay = () => {
  hideTimer = window.setTimeout(() => {
    showContent.value = !showContent.value;
    emit('contentHide');
  }, 400);
};

onMounted(() => {
  isOverflowing.value =
    target.value.clientWidth < target.value.scrollWidth || target.value.clientHeight < target.value.scrollHeight;
});

const show = () => {
  if (props.enablePopout) {
    window.clearTimeout(hideTimer);
    showContent.value = true;
    emit('contentShow');
  }
};

const hideOnOutsideClick = (event: Event) => {
  if (target.value.contains(event.target) || content.value.contains(event.target)) {
    return;
  }
  showContent.value = false;
  emit('contentHide');
  document.querySelector('body')?.removeEventListener('click', hideOnOutsideClick);
};

const toggleShow = () => {
  if (props.enablePopout) {
    showContent.value = !showContent.value;
    if (showContent.value) {
      document.querySelector('body')?.addEventListener('click', hideOnOutsideClick);
      emit('contentShow');
    } else {
      document.querySelector('body')?.removeEventListener('click', hideOnOutsideClick);
      emit('contentHide');
    }
  }
};
</script>

<style lang="postcss">
.pop-out {
  --pop-out-hitbox-grace: 20px;
  --pop-out-position: relative;
  --pop-out-content-max-width: 450px;

  position: var(--pop-out-position);
  display: flex;
  gap: var(--grid-base--x2);

  &__content {
    position: absolute;
    width: auto;
    overflow: hidden;
    visibility: hidden;
    background-color: var(--color-bg--z0);
    border: 1px solid var(--color-border--z0);
    border-radius: var(--border-radius);
    box-shadow: 0 4px 12px hsl(0deg 0% 0% / 15%);
    opacity: 0;
    transform: translateY(-2rem);
  }

  &__scroll {
    display: flex;
    flex-flow: column nowrap;
    justify-content: stretch;
    width: max-content;
    min-width: 100%;
    max-width: 100%;
    max-height: 40vh;
    overflow-y: auto;

    > * {
      padding: var(--grid-base--x2) var(--grid-base--x4);
    }
  }

  &--trigger-hover:hover,
  &--show-content {
    ^&__trigger {
      position: relative;

      &::before {
        position: absolute;
        left: 50%;
        width: 130%;
        height: 100%;
        cursor: pointer;
        content: '';
        transform: translateX(-50%);
      }
    }

    ^&__content {
      z-index: 10;
      visibility: visible;
      opacity: 1;
      transition-timing-function: cubic-bezier(0.75, -0.02, 0.2, 0.97);
      transition-duration: 0.5s;
      transition-property: transform, opacity;
      transform: translateY(0);
    }

    &.pop-out--pop-up {
      /* stylelint-disable-next-line no-descending-specificity */
      .pop-out__trigger::before {
        top: -100%;
      }
    }

    &.pop-out--pop-down {
      /* stylelint-disable-next-line no-descending-specificity */
      .pop-out__trigger::before {
        bottom: -100%;
      }
    }
  }

  &--scrollable {
    ^&__content {
      &::after {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 6.25rem;
        pointer-events: none;
        content: '';
        background: linear-gradient(
          0deg,
          hsl(var(--color-bg--z0-raw) / 100%) 0,
          hsl(var(--color-bg--z0-raw) / 90%) 15%,
          hsla(var(--color-bg--z0-raw) / 0%) 100%
        );
      }
    }

    ^&__scroll {
      scrollbar-width: none;

      &::-webkit-scrollbar {
        width: 0;
      }

      > *:nth-last-child(-n + 2) {
        position: relative;
        z-index: 20;
      }
    }
  }

  &--pop-down {
    ^&__content {
      top: calc(100% - calc(var(--grid-base--x2) * -1));
      right: 0;
    }
  }

  &--pop-up {
    ^&__content {
      bottom: calc(100% - calc(var(--grid-base--x2) * -1));
      left: 0;
    }
  }

  &--allow-fw {
    --pop-out-position: static;

    &.pop-out--pop-down {
      .pop-out__content {
        top: calc(42px + var(--grid-base--x2));
        right: var(--grid-base--x2);
        left: var(--grid-base--x2);
      }
    }

    @media (--two-columns-fit) {
      --pop-out-position: relative;

      &.pop-out--pop-down {
        .pop-out__content {
          right: 0;
          left: auto;
        }

        .pop-out__scroll {
          max-width: var(--pop-out-content-max-width);
        }
      }
    }
  }

  &--overflowing {
    ^&__content {
      right: 0;
      left: auto;
    }
  }
}
</style>
