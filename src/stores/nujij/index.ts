import { Screen } from 'perfapi';
import { defineStore } from 'pinia';

export interface NujijState {
  enabled: boolean;
  count: number;
}

export const useNuJijStore = defineStore('nujij', {
  state: (): NujijState => ({
    count: 0,
    enabled: false,
  }),
  actions: {
    setScreenCommentsMetadata(screen: Screen): void {
      this.enabled = !!screen.commentsEnabled;
      this.count = screen.commentsCount || 0;
    },
  },
});
