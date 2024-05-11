import { useHybridScripts } from 'vue3-hybrid-scripts';

export const useSkyScraper = () => {
  useHybridScripts('/assets/helpers/skyscraper.js', () => {});
};
