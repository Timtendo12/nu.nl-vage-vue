<template>
  <nav v-if="isTabBar" class="app-button-bar">
    <app-button
      v-for="(button, i) in block.buttons"
      :key="(button.title && button.title.text) || `bar-button-${i}`"
      :button-type="type"
      :class="getClassList(button)"
      :gtm-button-attributes="getGtmAttributes(button)"
      @click="handleClick(button)"
    >
      {{ (button.title && button.title.text) || 'Click' }}
    </app-button>
  </nav>

  <div v-else class="app-button-bar">
    <app-button
      v-for="(button, i) in block.buttons"
      :key="(button.title && button.title.text) || `bar-button-${i}`"
      :button-type="type"
      :class="getClassList(button)"
      colorway="green"
      :gtm-button-attributes="getGtmAttributes(button)"
      @click="handleClick(button)"
    >
      {{ (button.title && button.title.text) || 'Click' }}
    </app-button>
  </div>
</template>

<script setup lang="ts">
import {
  BarButton,
  ButtonBarBlock,
  ButtonsPresentationStyle,
  GTMLinkAttributes,
  isConsentTarget,
  isFormSubmitTarget,
  isLoginTarget,
  isSetVariablesTarget,
} from 'perfapi';
import { v4 as uuidv4 } from 'uuid';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import { useContentStore } from '@/stores/content';
import { useFormElementBlockStore } from '@/stores/formElement';
import { login } from '@/utils/auth';
import { updateConsent } from '@/utils/privacyGate';
import { idFromPath } from '@/utils/target';

import { resolvedParentBlock } from '../BlockResolver.vue';

const props = defineProps<{
  block: ButtonBarBlock;
}>();

defineEmits<{ (e: 'change'): void }>();

const route = useRoute();
const contentStore = useContentStore();
const formElementStore = useFormElementBlockStore();
const parentBlock = resolvedParentBlock();
const actionDataKey = uuidv4();

const getClassList = (button: BarButton): string[] => {
  const list: string[] = [];

  if (props.block.buttonsPresentationStyle === ButtonsPresentationStyle.Tabs) {
    list.push('tab');
    const showTab = isSetVariablesTarget(button.target)
      ? button.target.variables?.find((variable) => variable.name === 'showTab')
      : undefined;
    if (showTab?.value === contentStore.screenVariables['showTab']) {
      list.push('tab--active');
    }
  }

  return list;
};

const isTabBar = computed(() =>
  props.block.buttonsPresentationStyle === ButtonsPresentationStyle.Tabs ? true : false,
);

const type = computed(() => (isTabBar.value ? 'cta' : ''));

const handleClick = (button: BarButton) => {
  if (isSetVariablesTarget(button.target)) {
    contentStore.updateScreenVariables(button.target.variables);
  } else if (isConsentTarget(button.target)) {
    updateConsent();
  } else if (isLoginTarget(button.target)) {
    login({
      dpg_medium: 'loginwall',
      dpg_campaign: idFromPath(route.path),
      dpg_term: 'go-to-login-button',
      dpg_source: 'nu',
    });
  } else if (isFormSubmitTarget(button.target)) {
    formElementStore.handleQuestionFormData({
      actionData: [{ key: actionDataKey, value: formElementStore.formElementBlockTextArea }],
      groupId: button.target.groupId,
      id: idFromPath(route.path),
      tagIds: button.target.tagIds,
      originalBlock: parentBlock,
    });
  }
};

const getGtmAttributes = (button: BarButton): GTMLinkAttributes | undefined => {
  if (isLoginTarget(button.target)) {
    return {
      __typename: 'GTMLinkAttributes',
      category: 'login_wall',
      action: 'click',
      label: 'go-to-login-button',
    };
  } else if (isFormSubmitTarget(button.target)) {
    return {
      __typename: 'GTMLinkAttributes',
      category: 'news_question',
      action: 'click',
      label: 'submit-news_question-button',
    };
  }
};
</script>

<style lang="postcss">
.app-button-bar {
  margin: 0;
  border: 0;
}

.tab {
  &--active,
  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-position: under;
  }

  &:first-of-type {
    padding-left: 0;
  }
}
</style>
