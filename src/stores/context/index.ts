import { OutputMode } from '@server/middleware/OutputMode';
import { defineStore } from 'pinia';

export interface ContextState {
  outputMode: OutputMode;
}

export const useContextStore = defineStore('context', {
  state: (): ContextState => ({
    outputMode: OutputMode.DEFAULT,
  }),
  actions: {
    setOutputMode(mode: OutputMode) {
      this.outputMode = mode;
    },
  },
  getters: {
    inFallbackMode: (state) => state.outputMode == OutputMode.FALLBACK,
  },
});
