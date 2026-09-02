import {
  confirmedContractVersionListSchema,
  type ConfirmedContractVersion,
} from "@loopz/contracts/versioning";

export function versionStorageKey(projectId: string): string {
  return `loopz:project:${projectId}:versions`;
}

export function loadContractVersions(projectId: string): ConfirmedContractVersion[] {
  const raw = localStorage.getItem(versionStorageKey(projectId));
  if (!raw) return [];
  return confirmedContractVersionListSchema.parse(JSON.parse(raw));
}

export function appendContractVersion(
  projectId: string,
  version: ConfirmedContractVersion,
): ConfirmedContractVersion[] {
  if (version.projectId !== projectId) throw new Error("Version project ID does not match.");
  const versions = loadContractVersions(projectId);
  if (
    versions.some(
      (existing) =>
        existing.versionId === version.versionId || existing.version === version.version,
    )
  ) {
    throw new Error("This contract version already exists and cannot be overwritten.");
  }
  const expectedVersion = (versions.at(-1)?.version ?? 0) + 1;
  if (version.version !== expectedVersion) {
    throw new Error(`The next confirmed contract must be version ${expectedVersion}.`);
  }
  if (versions.some((existing) => existing.contractHash === version.contractHash)) {
    throw new Error("This exact contract content is already confirmed. Edit the review first.");
  }
  const updated = confirmedContractVersionListSchema.parse([...versions, version]);
  localStorage.setItem(versionStorageKey(projectId), JSON.stringify(updated));
  return updated;
}
