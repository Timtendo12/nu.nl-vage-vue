import { jwtDecode } from 'jwt-decode';
import { defineStore } from 'pinia';

export interface PipUser {
  UID?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

export interface PipTokens {
  ['dpg-component-at']?: string;
  ['dpg-component-uit']?: string;
  ['pip-refresh-token']?: string;
}

export interface UserState {
  user?: PipUser;
  pipTokens?: PipTokens;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: {
      UID: '',
      firstName: '',
      middleName: '',
      lastName: '',
      fullName: '',
      email: '',
    },
    pipTokens: {
      ['dpg-component-at']: '',
      ['dpg-component-uit']: '',
      ['pip-refresh-token']: '',
    },
  }),
  actions: {
    initializeUser({ pipTokens }: { pipTokens: PipTokens }) {
      let pipUser: PipUser | undefined;
      const pipIdToken = pipTokens['dpg-component-uit'];

      if (pipIdToken) {
        const decodedIdToken = jwtDecode<{
          sub: string;
          name: string;
          given_name: string;
          middle_name: string;
          family_name: string;
          email: string;
        }>(pipIdToken);
        if (decodedIdToken) {
          pipUser = {
            UID: decodedIdToken.sub,
            firstName: decodedIdToken.given_name,
            middleName: decodedIdToken.middle_name,
            lastName: decodedIdToken.family_name,
            fullName: decodedIdToken.name,
            email: decodedIdToken.email,
          };
        }
      }

      this.user = pipUser;
      this.pipTokens = pipTokens;
    },
  },
});
