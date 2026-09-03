import type { RunState } from "@loopz/contracts/run";

const READABLE_ASSESSMENT_STATES: ReadonlySet<RunState> = new Set([
  "assessed",
  "repair_generated",
  "completed",
  "blocked",
]);

export function canReadExistingAssessment(state: RunState): boolean {
  return READABLE_ASSESSMENT_STATES.has(state);
}
