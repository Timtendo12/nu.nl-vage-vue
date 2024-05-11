import { Auth, getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  Firestore,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';
import Cookies from 'js-cookie';
import { computed, ref } from 'vue';

import { PipUser } from '@/stores/user';
import { getEnvVariable } from '@/utils/config';
import { getFirebase } from '@/utils/firebaseApp';

import { Notification } from './interfaces';

const notificationsFetchLimit = parseInt(getEnvVariable('VITE_NOTIFICATIONS_FETCH_LIMIT', '50'), 10);
const firebaseToken = Cookies.get('firebaseToken')?.toString() || '';

let db: Firestore;
let unsubscribe: () => void;
let auth: Auth;
const notifications = ref<Record<string, Notification>>({});
const unreadNotifications = computed<Record<string, Notification>>(() =>
  Object.fromEntries(Object.entries(notifications.value).filter(([, notification]) => !notification.is_read)),
);
let firebaseCollection: string;

const isNotification = (input: unknown) => {
  const fields = ['updated_at', 'generated_id', 'context', 'type', 'is_read'];
  return input && typeof input == 'object' && fields.every((field) => field in input);
};

const connect = async (user: PipUser) => {
  firebaseCollection = `users/${user.UID}/notifications`;
  db = getFirestore(getFirebase());
  auth = getAuth();
  await signInWithCustomToken(auth, firebaseToken);
  const q = query(collection(db, firebaseCollection), orderBy('updated_at', 'desc'), limit(notificationsFetchLimit));
  unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'removed') {
        delete notifications.value[change.doc.id];
      } else if (isNotification(change.doc.data())) {
        notifications.value[change.doc.id] = change.doc.data() as Notification;
      }
    });
  });
};

const disconnect = () => {
  unsubscribe();
  notifications.value = {};
  signOut(auth);
};

const markAllAsRead = async () => {
  const unreadNotificationIds = Object.entries(notifications.value)
    .filter(([, notification]) => !notification.is_read)
    .map(([id]) => id);

  if (unreadNotificationIds.length > 0) {
    const batch = writeBatch(db);

    for (const unreadNotificationId of unreadNotificationIds) {
      batch.update(doc(db, firebaseCollection, unreadNotificationId), { is_read: true });
    }
    await batch.commit();
  }
};

export { connect, disconnect, markAllAsRead, notifications, unreadNotifications };
