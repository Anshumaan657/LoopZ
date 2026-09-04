export class StorageQuotaExceededError extends Error {
  constructor(message = "Browser storage quota exceeded. Clear LoopZ data in browser settings or use a different browser profile.") {
    super(message);
    this.name = "StorageQuotaExceededError";
  }
}

export class StorageCorruptedError extends Error {
  constructor(message = "Saved data is corrupted. Clear LoopZ data in browser settings to start fresh.") {
    super(message);
    this.name = "StorageCorruptedError";
  }
}

function isQuotaExceeded(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.code === 22);
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    if (isQuotaExceeded(error)) throw new StorageQuotaExceededError();
    throw new StorageCorruptedError(`Failed to read ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    if (isQuotaExceeded(error)) throw new StorageQuotaExceededError();
    throw new StorageCorruptedError(`Failed to write ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (isQuotaExceeded(error)) throw new StorageQuotaExceededError();
    throw new StorageCorruptedError(`Failed to remove ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function safeParseJSON<T>(raw: string | null, key: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new StorageCorruptedError(`Failed to parse ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function safeStringify<T>(value: T, key: string): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    throw new StorageCorruptedError(`Failed to stringify ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function safeSetItemsAtomically(entries: readonly (readonly [string, string])[]): void {
  const previous = entries.map(([key]) => [key, safeGetItem(key)] as const);

  try {
    for (const [key, value] of entries) safeSetItem(key, value);
  } catch (cause) {
    let rollbackFailure: unknown;
    for (const [key, value] of [...previous].reverse()) {
      try {
        safeRemoveItem(key);
        if (value !== null) safeSetItem(key, value);
      } catch (error) {
        rollbackFailure ??= error;
      }
    }
    if (rollbackFailure) {
      throw new StorageCorruptedError("Browser storage failed during a write and could not be fully restored. Clear LoopZ data before continuing.");
    }
    throw cause;
  }
}
