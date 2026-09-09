import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  type Firestore,
} from "firebase/firestore";

import { getFirebaseServices } from "../../lib/firebase-client";
import {
  LOOPZ_STORAGE_CHANGE_EVENT,
  type LoopZStorageChange,
} from "../../lib/storage";

const SYNC_METADATA_KEY = "loopz:cloud-sync-metadata";
const ACTIVE_USER_KEY = "loopz:active-user";
export const CLOUD_HYDRATED_EVENT = "loopz:cloud-hydrated";

type CloudStateDocument = {
  key: string;
  value: string;
  updatedAt: string;
};

type SyncMetadata = Record<string, string>;

export function isWorkflowStorageKey(key: string): boolean {
  return key.startsWith("loopz:project:") || key.startsWith("loopz:run:") || key.startsWith("loopz:repair:");
}

export function encodeStorageKey(key: string): string {
  return encodeURIComponent(key);
}

function clearLocalWorkflowState(): void {
  const keys = Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index));
  for (const key of keys) {
    if (key && isWorkflowStorageKey(key)) window.localStorage.removeItem(key);
  }
  window.localStorage.removeItem(SYNC_METADATA_KEY);
}

export function prepareLocalStateForUser(userId: string): void {
  const previousUserId = window.localStorage.getItem(ACTIVE_USER_KEY);
  if (previousUserId && previousUserId !== userId) clearLocalWorkflowState();
}

export function markLocalStateOwner(userId: string): void {
  window.localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export function clearSignedOutLocalState(): void {
  if (!window.localStorage.getItem(ACTIVE_USER_KEY)) return;
  clearLocalWorkflowState();
  window.localStorage.removeItem(ACTIVE_USER_KEY);
}

function stateCollection(db: Firestore, userId: string) {
  return collection(db, "users", userId, "state");
}

function readMetadata(): SyncMetadata {
  const raw = window.localStorage.getItem(SYNC_METADATA_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as SyncMetadata
      : {};
  } catch {
    return {};
  }
}

function writeMetadata(metadata: SyncMetadata): void {
  window.localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(metadata));
}

function localWorkflowEntries(): Map<string, string> {
  const entries = new Map<string, string>();
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !isWorkflowStorageKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) entries.set(key, value);
  }
  return entries;
}

function parseCloudDocument(value: unknown): CloudStateDocument | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<CloudStateDocument>;
  if (
    typeof candidate.key !== "string" ||
    !isWorkflowStorageKey(candidate.key) ||
    typeof candidate.value !== "string" ||
    typeof candidate.updatedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.updatedAt))
  ) return null;
  return candidate as CloudStateDocument;
}

async function writeCloudValue(
  db: Firestore,
  userId: string,
  change: LoopZStorageChange,
): Promise<void> {
  const reference = doc(stateCollection(db, userId), encodeStorageKey(change.key));
  if (change.value === null) {
    await deleteDoc(reference);
    return;
  }
  await setDoc(reference, {
    key: change.key,
    value: change.value,
    updatedAt: change.changedAt,
  } satisfies CloudStateDocument);
}

export async function hydrateCloudState(userId: string): Promise<void> {
  const { db } = getFirebaseServices();
  const snapshot = await getDocs(stateCollection(db, userId));
  const remote = new Map<string, CloudStateDocument>();
  snapshot.forEach((item) => {
    const parsed = parseCloudDocument(item.data());
    if (parsed) remote.set(parsed.key, parsed);
  });

  const local = localWorkflowEntries();
  const metadata = readMetadata();
  const uploads: Promise<void>[] = [];
  const now = new Date().toISOString();

  for (const [key, cloud] of remote) {
    const localValue = local.get(key);
    const localUpdatedAt = metadata[key];
    if (localValue === undefined || !localUpdatedAt || cloud.updatedAt > localUpdatedAt) {
      window.localStorage.setItem(key, cloud.value);
      metadata[key] = cloud.updatedAt;
      local.delete(key);
      continue;
    }
    if (localUpdatedAt > cloud.updatedAt && localValue !== cloud.value) {
      uploads.push(writeCloudValue(db, userId, { key, value: localValue, changedAt: localUpdatedAt }));
    }
    local.delete(key);
  }

  for (const [key, value] of local) {
    const changedAt = metadata[key] ?? now;
    metadata[key] = changedAt;
    uploads.push(writeCloudValue(db, userId, { key, value, changedAt }));
  }

  await Promise.all(uploads);
  writeMetadata(metadata);
  window.dispatchEvent(new Event(CLOUD_HYDRATED_EVENT));
}

export type CloudSyncSubscription = {
  stop: () => void;
  flush: () => Promise<void>;
};

export function subscribeToCloudState(
  userId: string,
  onError: (error: Error) => void,
): CloudSyncSubscription {
  const { db } = getFirebaseServices();
  let queue = Promise.resolve();

  function enqueue(change: LoopZStorageChange) {
    if (!isWorkflowStorageKey(change.key)) return;
    queue = queue
      .then(async () => {
        await writeCloudValue(db, userId, change);
        const metadata = readMetadata();
        if (change.value === null) delete metadata[change.key];
        else metadata[change.key] = change.changedAt;
        writeMetadata(metadata);
      })
      .catch((cause: unknown) => {
        onError(cause instanceof Error ? cause : new Error("Cloud history could not be updated."));
      });
  }

  const onLoopZChange = (event: Event) => {
    enqueue((event as CustomEvent<LoopZStorageChange>).detail);
  };
  const onStorage = (event: StorageEvent) => {
    if (!event.key || !isWorkflowStorageKey(event.key)) return;
    enqueue({ key: event.key, value: event.newValue, changedAt: new Date().toISOString() });
  };

  window.addEventListener(LOOPZ_STORAGE_CHANGE_EVENT, onLoopZChange);
  window.addEventListener("storage", onStorage);
  return {
    stop: () => {
      window.removeEventListener(LOOPZ_STORAGE_CHANGE_EVENT, onLoopZChange);
      window.removeEventListener("storage", onStorage);
    },
    flush: () => queue,
  };
}
