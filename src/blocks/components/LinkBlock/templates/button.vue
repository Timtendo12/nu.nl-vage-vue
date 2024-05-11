<template>
  <app-target-link
    v-if="isUrlTarget(block.link?.target)"
    :target="block.link.target"
    class="app-button app-button--inversed"
    :gtm-link-attributes="gtmLinkAttributes"
  >
    {{ block.link?.title?.text }}
  </app-target-link>

  <app-button
    v-else
    :disabled="!enabledButton"
    class="app-button--inversed"
    :gtm-button-attributes="gtmLinkAttributes"
    @click="enabledButton && buttonClicked()"
  >
    <AppIcon v-if="extractedIconComponent" embed embed-alt="" width="15" height="15">
      <component :is="extractedIconComponent" />
    </AppIcon>
    <span class="btn-title">{{ block.link?.title?.text }}</span>
  </app-button>
</template>

<script setup lang="ts">
import { ActionData, isButtonLinkFlavor, isGraphic, isRemoteTarget, isUrlTarget, TargetPermission } from 'perfapi';
import { computed } from 'vue';

import { resolvedParentBlock } from '@/blocks/BlockResolver.vue';
import AppButton from '@/components/AppButton.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppTargetLink from '@/components/AppTargetLink.vue';
import { mapPerfApiIcon } from '@/components/icons';
import { useContentStore } from '@/stores/content';
import { useDpns } from '@/utils/dpns';

import { LinkBlockProps } from '../LinkBlock.vue';

const props = defineProps<LinkBlockProps>();
const parentBlock = resolvedParentBlock();

const dpns = useDpns();
const contentStore = useContentStore();

const buttonIcon = computed(() => {
  if (isButtonLinkFlavor(props.block.link?.linkFlavor) && props.block.link?.linkFlavor?.prefixIcon) {
    return isGraphic(props.block.link?.linkFlavor?.prefixIcon) ? props.block.link?.linkFlavor.prefixIcon.name : null;
  } else {
    return null;
  }
});

const isDpns = computed(
  () =>
    isRemoteTarget(props.block.link?.target) &&
    props.block.link.target.permissions?.includes(TargetPermission.Notification),
);

const extractedIconComponent = computed(() => mapPerfApiIcon(buttonIcon.value));

const buttonClicked = async () => {
  if (isRemoteTarget(props.block.link?.target) && props.block.link.target.action) {
    if (isDpns.value && dpns.isLoaded.value) {
      await dpns.instance?.subscribe();
    }

    const actionData: ActionData = { notification: { dpns_device: dpns.instance?.getDeviceSecret() } };
    return contentStore.handleAction({
      actionData,
      id: props.block.link.target.action,
      originalBlock: parentBlock,
    });
  }
};

const enabledButton = computed(() => {
  if (isDpns.value) {
    return dpns.isLoaded.value;
  }
  return true;
});
</script>
