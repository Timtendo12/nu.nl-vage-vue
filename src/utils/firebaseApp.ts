import { FirebaseApp, initializeApp } from 'firebase/app';

import { getEnvVariable } from '@/utils/config';

let firebaseApp: FirebaseApp;
export const getFirebase = (databaseURL?: string) => {
  const firebaseParams = {
    databaseURL: databaseURL || getEnvVariable('VITE_FIREBASE_DATABASE_URL'),
    apiKey: getEnvVariable('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVariable('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVariable('VITE_FIREBASE_PROJECT_ID'),
  };

  firebaseApp = firebaseApp || initializeApp(firebaseParams);
  return firebaseApp;
};
