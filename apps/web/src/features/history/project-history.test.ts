import { describe, expect, it } from "vitest";

import { listProjectHistory } from "./project-history";

function memoryStorage(values: Record<string, string>) {
  const entries = Object.entries(values);
  return {
    get length() { return entries.length; },
    getItem(key: string) { return values[key] ?? null; },
    key(index: number) { return entries[index]?.[0] ?? null; },
  };
}

describe("project history", () => {
  it("lists projects newest first and resumes an active run", () => {
    const projectId = "11111111-1111-4111-8111-111111111111";
    const runId = "22222222-2222-4222-8222-222222222222";
    const storage = memoryStorage({
      [`loopz:project:${projectId}`]: JSON.stringify({
        projectId,
        createdAt: "2026-01-01T00:00:00.000Z",
        intake: { originalPrompt: "Build a thoughtful habit tracker\nwith weekly review." },
      }),
      [`loopz:run:${runId}`]: JSON.stringify({
        runId,
        projectId,
        contractVersionId: "33333333-3333-4333-8333-333333333333",
        state: "awaiting_evidence",
        updatedAt: "2026-01-02T00:00:00.000Z",
      }),
    });

    expect(listProjectHistory(storage)).toEqual([expect.objectContaining({
      projectId,
      title: "Build a thoughtful habit tracker",
      stage: "Awaiting evidence",
      resumeHref: `/runs/${runId}/evidence`,
    })]);
  });

  it("ignores malformed and non-project storage entries", () => {
    const storage = memoryStorage({
      "loopz:project:bad": "not-json",
      "loopz:run:other": JSON.stringify({ runId: "other" }),
      "unrelated": "value",
    });
    expect(listProjectHistory(storage)).toEqual([]);
  });
});
