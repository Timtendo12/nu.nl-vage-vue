<template>
  <aside ref="banner" aria-hidden="true" :class="classList">
    <div :id="`${slotName}-${source}__slot`" class="banner__slot"></div>
  </aside>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';

import { AdvertDeviceMap } from '@/utils/adFramework';
import { isSingleColumnMQ } from '@/utils/columns';

const props = withDefaults(
  defineProps<{
    slotName: string;
    blockId?: string | undefined;
    showInSingleColumn?: boolean;
    showInDoubleColumn?: boolean;
  }>(),
  {
    blockId: undefined,
    showInSingleColumn: true,
    showInDoubleColumn: true,
  },
);

const showConditionsMet = ref(false);
const isSlotLoaded = ref(false);
const banner = ref<Element>();
const source = props.blockId || 'fixed';
const classList = {
  banner: true,
  [`banner--${props.slotName}`]: true,
  'banner--hide-single-column': !props.showInSingleColumn,
  'banner--hide-double-column': !props.showInDoubleColumn,
};

const onSlotRendered = () => {
  isSlotLoaded.value = true;
};

const slotsToClose: string[] = [];
const onFrameworkLoaded = () => {
  const adSettings = window.advert.getSettings!();
  const slotMapping = adSettings.slotNameMappings[props.slotName];
  let slotName: string;

  try {
    switch (true) {
      case typeof slotMapping === 'string':
        slotName = slotMapping as string;
        break;
      case isSingleColumnMQ?.matches:
        slotName = (slotMapping as AdvertDeviceMap).small;
        break;
      default:
        slotName = (slotMapping as AdvertDeviceMap).default;
    }

    window.advert.addHook!(`slot.${slotName}.rendered`, onSlotRendered);
    slotsToClose.push(slotName);
  } catch (e) {
    console.error('[BANNER] Slot not in config:', props.slotName, '\n\n slotMapping:', slotMapping);
  }
};
onUnmounted(() => slotsToClose.forEach((slot) => window.advert.removeHook!(`slot.${slot}.rendered`, onSlotRendered)));

onMounted(() => {
  watchEffect(() => {
    if (window.loadAdvertSlot && showConditionsMet.value) {
      window.loadAdvertSlot(props.slotName, `${props.slotName}-${source}__slot`);
      if (Array.isArray(window.advert.cmd)) {
        window.advert.cmd.push(['loaded', onFrameworkLoaded]);
      } else {
        onFrameworkLoaded();
      }
    }
  });
});

const columnTest = (singleColumnTestResult: MediaQueryListEvent | MediaQueryList) => {
  if (singleColumnTestResult.matches === true) {
    if (props.showInSingleColumn) {
      showConditionsMet.value = true;
    }
  } else {
    if (props.showInDoubleColumn) {
      showConditionsMet.value = true;
    }
  }
};

onMounted(() => {
  if ((props.showInSingleColumn || props.showInDoubleColumn) && isSingleColumnMQ) {
    columnTest(isSingleColumnMQ);
    isSingleColumnMQ.addEventListener('change', columnTest);
  } else {
    showConditionsMet.value = true;
  }
});

onUnmounted(() => {
  if ((props.showInSingleColumn || props.showInDoubleColumn) && isSingleColumnMQ) {
    isSingleColumnMQ.removeEventListener('change', columnTest);
  }
});
</script>

<style lang="postcss">
.banner {
  margin: 0;

  &--o1,
  &--o2 {
    min-height: var(--ad-o-series-min-height);
  }

  &--r1,
  &--r2,
  &--r3,
  &--r-lb1,
  &--r-lb2,
  &--r-lb3,
  &--r-lb4,
  &--wsc-r1,
  &--wsc-r2,
  &--wsc-r3,
  &--wsc-r4 {
    min-height: var(--ad-r-series-min-height);
  }

  &--c1 {
    min-height: var(--ad-c1-min-height-mobile);
  }

  &--r3 {
    min-width: 300px;
  }

  &--hide-single-column {
    display: none;
  }

  &--wsc-r1.banner--hide-double-column + .app-divider {
    display: none;
  }

  @media (--two-columns-fit) {
    &--hide-single-column {
      display: block;
    }

    &--hide-double-column {
      display: none;
    }

    &--c1 {
      min-height: var(--ad-c1-min-height-desktop);
    }
  }

  &__slot {
    position: relative;
    min-width: inherit;
    min-height: inherit;
  }

  &__placeholder {
    position: absolute;
    width: 100%;
    min-width: inherit;
    min-height: inherit;
    background-color: var(--color-bg--z0);
  }
}
</style>
