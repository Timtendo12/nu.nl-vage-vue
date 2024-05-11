import { computed, Ref, ref } from 'vue';

export interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
  elementRef: Ref<Element | undefined>,
  { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false }: Args,
): { stop: () => void; isIntersecting: Ref<boolean>; isSupported: boolean } => {
  const isIntersecting = ref<boolean>(false);
  const frozen = computed(() => isIntersecting.value && freezeOnceVisible);

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    if (!frozen.value) {
      isIntersecting.value = entry.isIntersecting;
    }
  };

  const element = elementRef.value;
  const isSupported = !!window.IntersectionObserver;
  if (!isSupported || frozen.value || !element) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return { stop: () => {}, isIntersecting, isSupported };
  }
  const observerParams = { threshold, root, rootMargin };
  const observer = new IntersectionObserver(updateEntry, observerParams);
  observer.observe(element);
  return { stop: () => observer.disconnect(), isIntersecting, isSupported };
};
