import { onMounted, onUnmounted, Ref, watch, WatchStopHandle } from 'vue';

import { useIntersectionObserver } from '@/composables/intersection-observer/use-intersection-observer';

let _mocked = false;

export const useWhenPartlyInView = ({
  target,
  threshold,
  callback,
}: {
  target: Ref<Element | undefined>;
  threshold: number;
  callback: () => void;
}) => {
  if (_mocked) {
    callback();
    return;
  }

  let unwatchWhenInView: WatchStopHandle | undefined;

  onMounted(() => {
    const { stop, isIntersecting } = useIntersectionObserver(target, { freezeOnceVisible: true, threshold });
    watch(isIntersecting, (newValue: boolean) => newValue && callback());
    unwatchWhenInView = stop;
  });
  onUnmounted(() => {
    unwatchWhenInView?.();
  });
};

export const useWhenInView = ({ target, callback }: { target: Ref<Element | undefined>; callback: () => void }) =>
  useWhenPartlyInView({ target, threshold: 0, callback });

export const useWhenFullyInView = ({ target, callback }: { target: Ref<Element | undefined>; callback: () => void }) =>
  useWhenPartlyInView({ target, threshold: 1, callback });

export const mockWhenInView = () => {
  _mocked = true;
  return () => (_mocked = false);
};
