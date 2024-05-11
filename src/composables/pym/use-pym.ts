import * as pym from 'pym.js';
import { onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';

import { useContentHeight } from '@/composables/content-height/use-content-height';

const pym_child =
  typeof window !== 'undefined' ? (typeof window.pym !== 'undefined' ? new window.pym.Child() : new pym.Child()) : null;

// send a request to a parent
const doRequest = (messageType: string, message?: string): void => {
  if (pym_child === null) {
    return;
  }
  if (message) {
    pym_child.sendMessage(messageType, message);
  } else {
    pym_child.sendMessage(messageType, '');
  }
  if (process.env.NODE_ENV === 'development') console.debug(messageType);
};

// informs a parent about the current height
const sendHeight = (): void => {
  if (pym_child !== null) {
    pym_child.sendHeight();
  }
};

// fetches theme from the parent, we need to call it manually after
// component is mounted
const fetchTheme = function (): void {
  doRequest('theme');
};

// Light wrapper which is called to communicate theme, height and path state
// between iframe parent and child
export const usePym = (): { theme: Ref<string>; navigate: Ref<string> } => {
  const theme = ref('');
  const navigate = ref('');

  if (pym_child) {
    pym_child.onMessage('theme', (data: string) => {
      const dataObject = JSON.parse(data);
      theme.value = dataObject['theme'];
    });

    pym_child.onMessage('navigate', (data: string) => {
      // Parent informs us that navigation path was updated.
      const dataObject = JSON.parse(data);
      navigate.value = dataObject['to'];
    });

    onMounted(() => {
      fetchTheme();
      // After mounting send the current height to parent and create Observer
      // to monitor changes in the document to keep the parent up to date.
      sendHeight();
    });

    const { contentHeight } = useContentHeight();
    const unwatch = watch(contentHeight, () => {
      sendHeight();
    });
    onBeforeUnmount(() => unwatch());
  }
  return { theme, navigate };
};

// notifies parent about path changes so it can adjust history and navbar
export const sendNavigate = (to: string): void => {
  doRequest('navigate', JSON.stringify({ to: to }));
};
