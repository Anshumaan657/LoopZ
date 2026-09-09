import { safeRemoveItem } from "../../lib/storage";

export type ProjectHistoryEntry = {
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  stage: string;
  resumeHref: string;
  runId: string | null;
};

type StorageReader = Pick<Storage, "getItem" | "key" | "length">;

function parseObject(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function asDate(value: unknown, fallback: string): string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : fallback;
}

function titleFromRecord(record: Record<string, unknown>): string {
  const intake = parseRecord(record.intake);
  const prompt = typeof intake?.originalPrompt === "string" ? intake.originalPrompt.trim() : "";
  const firstLine = prompt.split(/\r?\n/)[0]?.trim() ?? "";
  if (!firstLine) return "Untitled LoopZ project";
  return firstLine.length > 88 ? `${firstLine.slice(0, 85).trimEnd()}…` : firstLine;
}

function parseRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function readRuns(storage: StorageReader): Record<string, unknown>[] {
  const runs: Record<string, unknown>[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !/^loopz:run:[^:]+$/.test(key)) continue;
    const run = parseObject(storage.getItem(key));
    if (run) runs.push(run);
  }
  return runs;
}

function routeForRun(projectId: string, run: Record<string, unknown>): { href: string; stage: string } {
  const runId = String(run.runId ?? "");
  const versionId = String(run.contractVersionId ?? "");
  const state = String(run.state ?? "task_generated");
  if (state === "task_generated" || state === "copied") {
    return { href: `/projects/${projectId}/task?version=${encodeURIComponent(versionId)}`, stage: state === "copied" ? "Task copied" : "Task ready" };
  }
  if (state === "awaiting_evidence" || state === "evidence_submitted") {
    return { href: `/runs/${runId}/evidence`, stage: state === "evidence_submitted" ? "Evidence returned" : "Awaiting evidence" };
  }
  if (state === "repair_generated") return { href: `/runs/${runId}/repair`, stage: "Repair ready" };
  if (state === "completed") return { href: `/runs/${runId}/assessment`, stage: "Completed" };
  if (state === "blocked") return { href: `/runs/${runId}/assessment`, stage: "Blocked" };
  return { href: `/runs/${runId}/assessment`, stage: "Assessment ready" };
}

export function listProjectHistory(storage: StorageReader): ProjectHistoryEntry[] {
  const runs = readRuns(storage);
  const entries: ProjectHistoryEntry[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;
    const match = key?.match(/^loopz:project:([^:]+)$/);
    if (!match) continue;
    const projectId = match[1];
    const record = parseObject(storage.getItem(key));
    if (!projectId || !record || record.projectId !== projectId) continue;

    const createdAt = asDate(record.createdAt, new Date(0).toISOString());
    const projectRuns = runs
      .filter((run) => run.projectId === projectId)
      .sort((a, b) => asDate(b.updatedAt, createdAt).localeCompare(asDate(a.updatedAt, createdAt)));
    const latestRun = projectRuns[0];
    const versionsRaw = storage.getItem(`loopz:project:${projectId}:versions`);
    let latestVersion: Record<string, unknown> | null = null;
    try {
      const versions = versionsRaw ? JSON.parse(versionsRaw) as unknown : null;
      if (Array.isArray(versions)) latestVersion = parseRecord(versions.at(-1));
    } catch {
      latestVersion = null;
    }

    let stage = "Clarification";
    let resumeHref = `/projects/${projectId}/interview`;
    if (latestRun) {
      ({ stage, href: resumeHref } = routeForRun(projectId, latestRun));
    } else if (latestVersion) {
      stage = "Task ready";
      resumeHref = `/projects/${projectId}/task?version=${encodeURIComponent(String(latestVersion.versionId ?? ""))}`;
    } else if (record.contractReview) {
      stage = "Final confirmation";
      resumeHref = `/projects/${projectId}/contract/confirm`;
    } else if (record.interview) {
      stage = "Contract review";
      resumeHref = `/projects/${projectId}/contract`;
    }

    const review = parseRecord(record.contractReview);
    const updatedAt = [
      createdAt,
      asDate(review?.updatedAt, createdAt),
      asDate(latestVersion?.confirmedAt, createdAt),
      asDate(latestRun?.updatedAt, createdAt),
    ].sort().at(-1) ?? createdAt;

    entries.push({
      projectId,
      title: titleFromRecord(record),
      createdAt,
      updatedAt,
      stage,
      resumeHref,
      runId: latestRun && typeof latestRun.runId === "string" ? latestRun.runId : null,
    });
  }
  return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function deleteProjectHistory(projectId: string): void {
  const keys = Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index)).filter((key): key is string => Boolean(key));
  const runIds = new Set<string>();
  const repairIds = new Set<string>();

  for (const key of keys) {
    if (!/^loopz:run:[^:]+$/.test(key)) continue;
    const run = parseObject(window.localStorage.getItem(key));
    if (run?.projectId === projectId && typeof run.runId === "string") runIds.add(run.runId);
  }
  for (const runId of runIds) {
    const raw = window.localStorage.getItem(`loopz:run:${runId}:repairs`);
    try {
      const repairs = raw ? JSON.parse(raw) as unknown : null;
      if (Array.isArray(repairs)) {
        for (const repair of repairs) {
          const parsed = parseRecord(repair);
          if (typeof parsed?.repairId === "string") repairIds.add(parsed.repairId);
        }
      }
    } catch {
      // Corrupt history is still removed using its known project and run keys.
    }
  }

  for (const key of keys) {
    if (key.startsWith(`loopz:project:${projectId}`)) safeRemoveItem(key);
    else if ([...runIds].some((runId) => key.startsWith(`loopz:run:${runId}`))) safeRemoveItem(key);
    else if ([...repairIds].some((repairId) => key.startsWith(`loopz:repair:${repairId}`))) safeRemoveItem(key);
  }
}
