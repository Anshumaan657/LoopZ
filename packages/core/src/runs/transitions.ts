import type { RunState } from "@loopz/contracts";

const allowedTransitions: Record<RunState, readonly RunState[]> = {
  draft: ["contract_confirmed", "abandoned"],
  contract_confirmed: ["task_generated", "abandoned"],
  task_generated: ["copied", "abandoned"],
  copied: ["awaiting_evidence", "abandoned"],
  awaiting_evidence: ["evidence_submitted", "abandoned"],
  evidence_submitted: ["assessed", "blocked"],
  assessed: ["repair_generated", "awaiting_evidence", "completed", "blocked"],
  repair_generated: ["awaiting_evidence", "blocked"],
  completed: [],
  blocked: [],
  abandoned: [],
};

export function canTransition(from: RunState, to: RunState): boolean {
  return allowedTransitions[from].includes(to);
}
