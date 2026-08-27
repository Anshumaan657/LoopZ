import {
  LOOP_SPEC_SCHEMA_VERSION,
  loopSpecLiteSchema,
  type ArtifactKind,
  type LoopSpecLite,
  type RenderedArtifactMetadata,
} from "@loopz/contracts";

import {
  CODEX_ARTIFACT_FILENAMES,
  type CodexArtifact,
  type CodexArtifactBundle,
  type CodexRenderOptions,
} from "./types";

const DEFAULT_GENERATOR_VERSION = "0.1.0";
const DEFAULT_ADAPTER_VERSION = "0.1.0";
const DEFAULT_TEMPLATE_VERSION = "0.1.0";

function bulletList(items: readonly string[], emptyValue = "None"): string {
  return items.length === 0 ? `- ${emptyValue}` : items.map((item) => `- ${item}`).join("\n");
}

function numberedList(items: readonly string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function escapeTableCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function makeMetadata(
  kind: ArtifactKind,
  options: Required<CodexRenderOptions>,
): RenderedArtifactMetadata {
  return {
    artifactId: `${options.runId}:${kind}:${options.templateVersion}`,
    runId: options.runId,
    kind,
    schemaVersion: LOOP_SPEC_SCHEMA_VERSION,
    generatorVersion: options.generatorVersion,
    adapterVersion: options.adapterVersion,
    templateVersion: options.templateVersion,
    generatedAt: options.generatedAt,
  };
}

function artifact(
  kind: ArtifactKind,
  content: string,
  options: Required<CodexRenderOptions>,
): CodexArtifact {
  return {
    filename: CODEX_ARTIFACT_FILENAMES[kind],
    content: content.trimEnd() + "\n",
    metadata: makeMetadata(kind, options),
  };
}

function renderProjectSpec(spec: LoopSpecLite): string {
  const included = spec.scope.included.map((item) => `${item.id}: ${item.description}`);
  const excluded = spec.scope.excluded.map((item) => `${item.id}: ${item.description}`);
  const assumptions = spec.scope.assumptions.map(
    (item) => `${item.value} (${item.source}, confidence ${item.confidence})`,
  );
  const technologies = spec.environment.technologyPreferences.map((item) => item.value);

  return `# Project Specification

## Goal

${spec.objective.goal.value}

## Original Request

${spec.request.originalPrompt}

## Task Type

${spec.request.taskType.value}

## Deliverables

${bulletList(
  spec.objective.deliverables.map(
    (item) => `${item.id} [${item.priority}]: ${item.description}`,
  ),
)}

## Included Scope

${bulletList(included)}

## Excluded Scope

${bulletList(excluded)}

## Assumptions

${bulletList(assumptions)}

## Project Context

- Status: ${spec.environment.projectStatus.value}
- Context: ${spec.environment.projectContext.value}
- Technology preferences:
${bulletList(technologies).split("\n").map((line) => `  ${line}`).join("\n")}

## Unresolved Decisions

${bulletList(
  spec.scope.unresolvedDecisions.map(
    (item) => `${item.id} [${item.risk}]: ${item.question}`,
  ),
)}
`;
}

function renderAcceptanceCriteria(spec: LoopSpecLite): string {
  const rows = spec.acceptance.criteria
    .map(
      (criterion) =>
        `| ${criterion.id} | ${criterion.requirementIds.join(", ")} | ${criterion.priority} | ${escapeTableCell(criterion.requirement)} | ${escapeTableCell(criterion.verificationMethod)} | ${escapeTableCell(criterion.requiredEvidence.join("; "))} |`,
    )
    .join("\n");

  return `# Acceptance Criteria

| ID | Requirement IDs | Priority | Requirement | Verification | Required Evidence |
| --- | --- | --- | --- | --- | --- |
${rows}

Every required criterion must be reported by its criterion ID with evidence references.
`;
}

function renderAgentTask(spec: LoopSpecLite): string {
  const requiredCriteria = spec.acceptance.criteria.filter(
    (criterion) => criterion.priority === "required",
  );
  const approvalActions = spec.safety.plannedActions
    .filter((action) => action.requiresApproval)
    .map((action) => `${action.category}: ${action.action}`);

  return `# Agent Task

## Objective

${spec.objective.goal.value}

## Required Deliverables

${bulletList(
  spec.objective.deliverables.map((item) => `${item.id}: ${item.description}`),
)}

## Execution Loop

${numberedList([
  "Inspect the available repository and project context before editing.",
  "Create a concise implementation plan mapped to the requirement IDs.",
  "Implement only the confirmed included scope.",
  "Run the specified verification for every acceptance criterion.",
  `Repair failures within a maximum of ${spec.limits.maximumRepairAttempts} attempts.`,
  "Stop when all required criteria have evidence or a stop condition is reached.",
])}

## Required Acceptance Criteria

${bulletList(
  requiredCriteria.map(
    (criterion) =>
      `${criterion.id} (${criterion.requirementIds.join(", ")}): ${criterion.requirement}\n  Verification: ${criterion.verificationMethod}\n  Evidence: ${criterion.requiredEvidence.join("; ")}`,
  ),
)}

## Restrictions

${bulletList(spec.safety.restrictedActions)}

## Human Approval Required

${bulletList([...spec.safety.approvalRequired, ...approvalActions])}

## Stop Conditions

${bulletList(spec.limits.stopWhen)}

## Final Report Contract

Include all of the following:
${bulletList(spec.finalReport.requiredFields)}

For every acceptance criterion, report:

- Criterion ID
- Status: passed, failed, blocked, or unverified
- Verification performed
- Evidence reference or exact missing evidence

Do not claim completion without criterion-level evidence. Do not expand scope silently. Ask for human approval when an approval gate is reached.
`;
}

function renderStarterPrompt(agentTask: string): string {
  return `Execute the following confirmed LoopZ task exactly as written. Preserve unrelated existing work, follow all approval gates, and return the required criterion-level final report.

${agentTask.trim()}
`;
}

export function renderCodexArtifacts(
  input: LoopSpecLite,
  renderOptions: CodexRenderOptions,
): CodexArtifactBundle {
  const spec = loopSpecLiteSchema.parse(input);
  const options: Required<CodexRenderOptions> = {
    runId: renderOptions.runId,
    generatedAt: renderOptions.generatedAt,
    generatorVersion: renderOptions.generatorVersion ?? DEFAULT_GENERATOR_VERSION,
    adapterVersion: renderOptions.adapterVersion ?? DEFAULT_ADAPTER_VERSION,
    templateVersion: renderOptions.templateVersion ?? DEFAULT_TEMPLATE_VERSION,
  };

  const projectSpec = renderProjectSpec(spec);
  const acceptanceCriteria = renderAcceptanceCriteria(spec);
  const agentTask = renderAgentTask(spec);

  return {
    projectSpec: artifact("project_spec", projectSpec, options),
    acceptanceCriteria: artifact("acceptance_criteria", acceptanceCriteria, options),
    agentTask: artifact("agent_task", agentTask, options),
    starterPrompt: artifact(
      "starter_prompt",
      renderStarterPrompt(agentTask),
      options,
    ),
  };
}
