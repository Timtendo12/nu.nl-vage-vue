import {
  DataSnapshot,
  getDatabase,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  onValue,
  ref as firebaseRef,
  Unsubscribe,
} from 'firebase/database';
import { ActionData, FirebaseRealTimeDataEventSource, isRemoteTarget, Target } from 'perfapi';

import { useContentStore } from '@/stores/content';
import { getFirebase } from '@/utils/firebaseApp';

interface Entry {
  id: number;
  is_pinned: boolean;
  is_protected: boolean;
  type: string;
  context: unknown;
  created_at: string;
  updated_at: string;
}
let first = true;
let entryIds: Set<string>;

enum HandlerSource {
  add,
  edit,
  delete,
}

const getHandler = (target: Target, source: HandlerSource) => (data: DataSnapshot) => {
  const contentStore = useContentStore();
  const entry: Entry = data.val();
  const contentId = entry.id.toString();

  if (source === HandlerSource.add) {
    // Filter out unique entries coming from firebase
    if (entryIds.has(contentId)) {
      return;
    }
    entryIds.add(contentId);
  }

  const actionData: ActionData = {
    contentUpdate: {
      contentId,
      screenId: contentStore.screenId,
    },
  };
  if (isRemoteTarget(target) && target.action) {
    contentStore.handleAction({ actionData, id: target.action });
  } else {
    // If this occurs, it means the BFF has been wrongly configured
    console.error('Unknown target type');
  }
};

/**
 * Sets up a firebase realtime db listener that will update the liveblog when the db changes
 * @param src db URL and liveblogId/itemId from the screen actions
 * @returns a function that will unsubscribe the listeners
 */
export const useFirebaseRealtimeDB = (src: FirebaseRealTimeDataEventSource) => {
  const { connectionString, itemId, addTarget, removeTarget, updateTarget } = src;
  const db = getDatabase(getFirebase(connectionString));
  const dbRef = firebaseRef(db, itemId);
  const unsubTracker: Unsubscribe[] = [];
  unsubTracker.push(
    onValue(dbRef, (snapshot: DataSnapshot) => {
      if (first) {
        first = false;
        const entries: Record<number, Entry> = snapshot.val();
        entryIds = new Set(Object.keys(entries));
        if (addTarget) {
          unsubTracker.push(onChildAdded(dbRef, getHandler(addTarget, HandlerSource.add)));
        }

        if (updateTarget) {
          unsubTracker.push(onChildChanged(dbRef, getHandler(updateTarget, HandlerSource.edit)));
        }

        if (removeTarget) {
          unsubTracker.push(onChildRemoved(dbRef, getHandler(removeTarget, HandlerSource.delete)));
        }
      }
    }),
  );
  return () => unsubTracker.forEach((unsub) => unsub());
};
