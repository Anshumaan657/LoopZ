import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearSignedOutLocalState,
  encodeStorageKey,
  isWorkflowStorageKey,
  markLocalStateOwner,
  prepareLocalStateForUser,
} from "./cloud-state";

function stubWindowStorage(initial: Record<string, string>) {
  const values = new Map(Object.entries(initial));
  const storage = {
    get length() { return values.size; },
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => { values.delete(key); },
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  vi.stubGlobal("window", { localStorage: storage });
  return values;
}

describe("cloud state boundaries", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("recognizes only persisted workflow keys", () => {
    expect(isWorkflowStorageKey("loopz:project:abc")).toBe(true);
    expect(isWorkflowStorageKey("loopz:run:abc:evidence")).toBe(true);
    expect(isWorkflowStorageKey("loopz:repair:abc:delivered")).toBe(true);
    expect(isWorkflowStorageKey("loopz:cloud-sync-metadata")).toBe(false);
    expect(encodeStorageKey("loopz:run:a:b")).toBe("loopz%3Arun%3Aa%3Ab");
  });

  it("clears another account's local workflow state but preserves unrelated data", () => {
    const values = stubWindowStorage({
      "loopz:active-user": "first-user",
      "loopz:project:abc": "project",
      "loopz:run:def": "run",
      "unrelated": "keep",
    });
    prepareLocalStateForUser("second-user");
    expect(values.has("loopz:project:abc")).toBe(false);
    expect(values.has("loopz:run:def")).toBe(false);
    expect(values.get("unrelated")).toBe("keep");
  });

  it("clears owned workflow state on sign-out", () => {
    const values = stubWindowStorage({ "loopz:project:abc": "project" });
    markLocalStateOwner("owner");
    clearSignedOutLocalState();
    expect(values.has("loopz:project:abc")).toBe(false);
    expect(values.has("loopz:active-user")).toBe(false);
  });
});
