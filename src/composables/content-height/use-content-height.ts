import { onMounted, onUnmounted, Ref, ref } from 'vue';

/**
 * Returns a ref to contentHeight which it will keep updating
 * dynamically with the current height of the whole document.
 */
export const useContentHeight = (): { contentHeight: Ref<number> } => {
  const contentHeight = ref(0);
  let observer: MutationObserver;
  let heightCheckTimeout: null | ReturnType<typeof setTimeout> = null;

  onMounted(() => {
    const rootNode = document.getElementById('app');
    if (!rootNode) {
      console.warn('Cannot find root element!');
      return;
    }
    const config = { attributes: true, childList: true, subtree: true };
    observer = new MutationObserver(() => {
      if (heightCheckTimeout) {
        return;
      }
      heightCheckTimeout = setTimeout(() => {
        heightCheckTimeout = null;
        const newHeight = rootNode.offsetHeight + rootNode.offsetTop;
        if (newHeight !== contentHeight.value) {
          contentHeight.value = newHeight;
        }
      }, 16);
    });
    observer.observe(rootNode, config);
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return { contentHeight };
};
