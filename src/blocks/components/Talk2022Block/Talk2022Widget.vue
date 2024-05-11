<template>
  <ExpertLabelModal v-if="showModal" :close-func="handleClose"></ExpertLabelModal>
  <div>
    <div id="coralTalk" ref="talk2022El" :class="classes"></div>
    <div v-if="loadState === 'loading'" class="talk2022-spinner-container">
      <svg class="talk2022-spinner" width="40px" height="40px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle class="circle" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref } from 'vue';
import { useHybridScripts } from 'vue3-hybrid-scripts';

import ExpertLabelModal from '@/blocks/components/Talk2022Block/TalkExpertLabelModal/ExpertLabelModal.vue';
import { usePreferencesStore } from '@/stores/preferences';

import { Talk2022EmitEvent, Talk2022WidgetInstance } from './Talk2022';

const preferencesStore = usePreferencesStore();

const loadState = ref<'loading' | 'loaded'>('loading');
const talk2022El: Ref<Element | undefined> = ref();
const talk2022Widget: Ref<Talk2022WidgetInstance | undefined> = ref(undefined);
const emits = defineEmits<{
  (e: 'talk2022Event', payload: Talk2022EmitEvent<unknown>): void;
}>();
const showModal = ref(false);

const handleClose = () => {
  showModal.value = false;
};

const props = defineProps<{
  storyUrl: string;
  talk2022Url: string;
  commentID?: string;
}>();

const initializeTalk2022 = () => {
  useHybridScripts(`${props.talk2022Url}/assets/js/embed.js`, () => {
    loadState.value = 'loaded';
    if (talk2022El.value) {
      talk2022Widget.value = window?.Coral?.createStreamEmbed({
        id: 'coralTalk',
        autoRender: true,
        rootURL: `${props.talk2022Url}`,
        storyURL: `${props.storyUrl}`,
        events: function (events) {
          events.onAny((eventName: string, data: unknown) => {
            if (eventName === 'nunl_labels.SHOW_EXPERT_LABEL_POPUP') {
              showModal.value = true;
            }
            emits('talk2022Event', {
              eventName,
              data,
            });
          });
        },
        containerClassName: preferencesStore.theme,
      });
    }
  });
};

onMounted(() => {
  initializeTalk2022();
});

defineExpose({
  logout: () => {
    talk2022Widget.value?.logout();
  },
  login: (payload: string) => {
    talk2022Widget.value?.login(payload);
  },
  message: (key: string, value: string) => {
    talk2022Widget.value?.message(key, value);
  },
});

const classes = computed(() => ['block-content', 'clearfix', { 'component-page': true }]);
</script>

<style lang="postcss">
.talk2022-spinner-container {
  display: flex;
  justify-content: center;

  .talk2022-spinner {
    .circle {
      stroke: #f67150;
      stroke-dasharray: 187;
      stroke-dashoffset: 0;
      transform-origin: center;
      animation:
        spinner-dash 1.4s ease-in-out infinite,
        spinner-colors 5.6s ease-in-out infinite;
    }

    @keyframes spinner-dash {
      0% {
        stroke-dashoffset: 187;
      }

      50% {
        stroke-dashoffset: 46.75;
        transform: rotate(135deg);
      }

      100% {
        stroke-dashoffset: 187;
        transform: rotate(450deg);
      }
    }

    @keyframes spinner-colors {
      0% {
        stroke: #f67150;
      }

      100% {
        stroke: #f6a47e;
      }
    }
  }
}
</style>
