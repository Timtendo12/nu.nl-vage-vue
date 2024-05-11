import { Rule } from 'perfapi';

import { useContentStore } from '@/stores/content';

export const useShouldBeShown = (): ((rule: Rule | undefined) => boolean) => (rule) => {
  const contentStore = useContentStore();
  if (!rule || !rule.variableName) return true;
  return contentStore.screenVariables[rule.variableName] === rule.variableValue;
};
