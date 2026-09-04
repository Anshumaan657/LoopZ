import { afterEach, describe, expect, it, vi } from "vitest";

import {
  safeGetItem,
  safeParseJSON,
  safeSetItem,
  StorageCorruptedError,
  StorageQuotaExceededError,
} from "./storage";

describe("safe browser storage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("translates quota failures into an actionable domain error", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); },
    });
    expect(() => safeSetItem("loopz:test", "value")).toThrow(StorageQuotaExceededError);
    expect(() => safeSetItem("loopz:test", "value")).toThrow("Clear LoopZ data");
  });

  it("reports corrupted JSON with the affected key", () => {
    expect(() => safeParseJSON("{broken", "loopz:project:test")).toThrow(StorageCorruptedError);
    expect(() => safeParseJSON("{broken", "loopz:project:test")).toThrow("loopz:project:test");
  });

  it("reports blocked browser storage reads", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new DOMException("Access denied", "SecurityError"); },
    });
    expect(() => safeGetItem("loopz:test")).toThrow(StorageCorruptedError);
  });
});
