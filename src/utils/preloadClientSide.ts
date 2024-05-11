import { inject, provide, useSSRContext } from 'vue';

export const preloadClientSide = (preloadPath: URL): void => {
  if (typeof window === 'undefined') {
    const ssrContext = useSSRContext();
    if (ssrContext) {
      ssrContext.modules.add(preloadPath.href);
    }
  }
};

export type PriorityContext = {
  priorityCandidate?: URL;
};

const prioContextKey = Symbol();

/* creates the context in which the first candidate is preloaded client side */
export const usePriorityLoadContext = () => {
  provide<PriorityContext>(prioContextKey, {});
};

/* preload the first candidate in context client side */
export const usePriorityLoading = (url: URL) => {
  const context = inject<PriorityContext>(prioContextKey);
  if (context && !context?.priorityCandidate) {
    context.priorityCandidate = url;
    preloadClientSide(url);
  }
};
