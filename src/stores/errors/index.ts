import { defineStore } from 'pinia';

export const useErrorStore = defineStore('errors', {
  state: () => ({
    errors: [] as Error[],
  }),
  actions: {
    setErrors(error: Error) {
      this.errors = [...this.errors, error];
    },
    handleError(e: unknown): void {
      /* Todo: the flagged errors here deal with flaky connection. We should handle these properly by:
       * - A retry scenario
       * - Providing the visitor with a neat error message
       *  For now these are stored in the store.
       */
      const flagged = ['geannuleerd', 'The network connection was lost.', 'Failed to fetch'];

      if (e instanceof Error) e = [e];
      if (Array.isArray(e)) {
        e.forEach((error: Error) => {
          if (error instanceof TypeError && flagged.includes(error.message)) {
            this.setErrors(error);
          } else {
            throw error;
          }
        });
      } else {
        throw e;
      }
    },
  },
});
