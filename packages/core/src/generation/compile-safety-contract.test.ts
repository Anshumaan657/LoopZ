import { describe, expect, it } from "vitest";

import {
  acceptanceContractDraftSchema,
  type AcceptanceContractDraft,
  type SafetyContractDraft,
} from "@loopz/contracts/loopspec";

import { compileSafetyContract, validateSafetyContractDraft } from "./compile-safety-contract";

function acceptanceFixture(): AcceptanceContractDraft {
  const provenance = (value: string) => ({
    value,
    source: "user_provided" as const,
    confidence: 1,
    explanation: "Confirmed source value.",
    confirmedByUser: true,
  });

  return acceptanceContractDraftSchema.parse({
    schemaVersion: "0.1",
    status: "acceptance_draft",
    projectId: "11111111-1111-4111-8111-111111111111",
    compilation: {
      sourceInterviewUpdatedAt: "2026-08-28T10:03:00.000Z",
      compiledAt: "2026-08-28T10:03:00.000Z",
    },
    request: {
      originalPrompt: "Add profile settings to an existing application.",
      taskType: provenance("existing_app_feature"),
    },
    objective: {
      goal: provenance("Let users manage their profile safely"),
      deliverables: [
        {
          id: "REQ-001",
          description: "Responsive profile settings page",
          priority: "required",
          provenance: provenance("Responsive profile settings page"),
        },
        {
          id: "REQ-002",
          description: "Integrate profile updates with an external identity API",
          priority: "required",
          provenance: provenance("Integrate profile updates with an external identity API"),
        },
      ],
    },
    scope: {
      included: [
        {
          id: "SCOPE-IN-001",
          description: "Profile settings",
          provenance: provenance("Profile settings"),
        },
      ],
      excluded: [],
      assumptions: [],
    },
    environment: {
      projectStatus: provenance("existing"),
      projectContext: provenance("Existing Next.js repository"),
      technologyPreferences: [provenance("Preserve the existing stack")],
    },
    interviewDecisions: [
      {
        questionId: "Q-001",
        category: "external_integrations",
        question: "Which external service should be used?",
        answer: "Use the existing identity API when approved",
        answeredAt: "2026-08-28T10:03:00.000Z",
      },
      {
        questionId: "Q-002",
        category: "verification",
        question: "How should completion be verified?",
        answer: "Run npm test and npm run build",
        answeredAt: "2026-08-28T10:04:00.000Z",
      },
    ],
    acceptance: {
      criteria: [
        {
          id: "AC-001",
          requirementIds: ["REQ-001"],
          requirement: "The profile settings page is responsive.",
          verificationMethod: "Run browser checks.",
          requiredEvidence: ["Screenshots", "Test output"],
          priority: "required",
        },
        {
          id: "AC-002",
          requirementIds: ["REQ-002"],
          requirement: "The external identity API handles success and failure.",
          verificationMethod: "Run integration tests.",
          requiredEvidence: ["Integration test output"],
          priority: "required",
        },
      ],
      verificationCommands: ["npm test", "npm run build"],
    },
    pendingSections: ["safety", "limits", "final_report"],
  });
}

function issueCodes(input: unknown): string[] {
  const result = validateSafetyContractDraft(input);
  return result.valid ? [] : result.issues.map((issue) => issue.code);
}

describe("compileSafetyContract", () => {
  it("produces a deterministic safety draft without mutating the acceptance draft", () => {
    const acceptance = acceptanceFixture();
    const before = structuredClone(acceptance);
    const first = compileSafetyContract(acceptance);
    const second = compileSafetyContract(acceptance);

    expect(first).toEqual(second);
    expect(acceptance).toEqual(before);
    expect(first.status).toBe("safety_draft");
    expect(first.pendingSections).toEqual(["limits", "final_report"]);
    expect(first.acceptance).toEqual(acceptance.acceptance);
    expect(first.safety.restrictedActions).toHaveLength(5);
    expect(first.contractChecks.findings.map((finding) => finding.id)).toEqual(
      first.contractChecks.findings.map((_, index) =>
        `FIND-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    expect(
      first.contractChecks.findings.every((finding) => finding.sourceReferences.length > 0),
    ).toBe(true);
    expect(validateSafetyContractDraft(first)).toEqual({ valid: true, value: first, issues: [] });
  });

  it("adds explicit approval gates for external services", () => {
    const draft = compileSafetyContract(acceptanceFixture());

    expect(draft.safety.plannedActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "external_service", requiresApproval: true }),
      ]),
    );
    expect(draft.safety.approvalRequired).toEqual(
      expect.arrayContaining(draft.safety.plannedActions.map((action) => action.action)),
    );
    expect(draft.contractChecks.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "approval_gate", severity: "warning" }),
      ]),
    );
  });

  it("classifies destructive, financial, credential, and staging actions", () => {
    const acceptance = acceptanceFixture();
    acceptance.objective.deliverables.push({
      id: "REQ-003",
      description: "Delete an account using a private API key",
      priority: "optional",
      provenance: acceptance.objective.deliverables[0]!.provenance,
    });
    acceptance.acceptance.criteria.push({
      id: "AC-003",
      requirementIds: ["REQ-003"],
      requirement: "The account is deleted only after confirmation.",
      verificationMethod: "Use a local mock.",
      requiredEvidence: ["Deletion test output"],
      priority: "optional",
    });
    acceptance.interviewDecisions.push(
      {
        questionId: "Q-003",
        category: "payments",
        question: "What payment level is required?",
        answer: "Real payment processing",
        answeredAt: "2026-08-28T10:05:00.000Z",
      },
      {
        questionId: "Q-004",
        category: "deployment",
        question: "Where should this run?",
        answer: "Staging environment",
        answeredAt: "2026-08-28T10:06:00.000Z",
      },
    );

    const categories = compileSafetyContract(acceptance).safety.plannedActions.map(
      (action) => action.category,
    );
    expect(categories).toEqual(
      expect.arrayContaining(["destructive", "financial", "credentials", "production"]),
    );
  });

  it("does not classify a payment prototype as a real financial action", () => {
    const acceptance = acceptanceFixture();
    acceptance.objective.deliverables[0]!.description = "Simulated payments prototype";
    acceptance.interviewDecisions.push({
      questionId: "Q-003",
      category: "payments",
      question: "What payment level is required?",
      answer: "Non-functional prototype",
      answeredAt: "2026-08-28T10:05:00.000Z",
    });

    expect(
      compileSafetyContract(acceptance).safety.plannedActions.some(
        (action) => action.category === "financial",
      ),
    ).toBe(false);
  });

  it("deduplicates the same action repeated in deliverable and scope text", () => {
    const acceptance = acceptanceFixture();
    acceptance.objective.deliverables[0]!.description = "Delete expired profile data";
    acceptance.scope.included[0]!.description = "Delete expired profile data";

    const destructive = compileSafetyContract(acceptance).safety.plannedActions.filter(
      (action) => action.category === "destructive",
    );

    expect(destructive).toHaveLength(1);
    expect(destructive[0]?.action).toContain("REQ-001");
  });

  it("retains payment and authentication scope contradictions as review warnings", () => {
    const acceptance = acceptanceFixture();
    acceptance.objective.deliverables[0]!.description = "Payment checkout and authentication login";
    acceptance.interviewDecisions.push(
      {
        questionId: "Q-003",
        category: "payments",
        question: "What payment level is required?",
        answer: "Exclude payments from this version",
        answeredAt: "2026-08-28T10:05:00.000Z",
      },
      {
        questionId: "Q-004",
        category: "authentication",
        question: "How should users sign in?",
        answer: "No authentication is required",
        answeredAt: "2026-08-28T10:06:00.000Z",
      },
    );

    const findings = compileSafetyContract(acceptance).contractChecks.findings;
    expect(findings.filter((item) => item.kind === "contradiction")).toHaveLength(2);
    expect(
      findings
        .filter((item) => item.kind === "contradiction")
        .every((item) => item.severity === "warning"),
    ).toBe(true);
  });

  it("blocks direct included/excluded scope conflicts", () => {
    const acceptance = acceptanceFixture();
    acceptance.scope.excluded.push({
      id: "SCOPE-OUT-001",
      description: "Profile settings!",
      provenance: acceptance.scope.included[0]!.provenance,
    });
    const draft = compileSafetyContract(acceptance);

    expect(draft.contractChecks.findings).toContainEqual(
      expect.objectContaining({ kind: "contradiction", severity: "blocking" }),
    );
    expect(issueCodes(draft)).toContain("scope_conflict");
  });

  it.each([
    ["authorization", "Not authorized", "blocking_decision_unresolved"],
    ["deployment", "Production", "blocking_decision_unresolved"],
    ["data_handling", "Store real patient medical records", "blocking_decision_unresolved"],
  ] as const)("blocks an unsafe %s decision", (category, answer, issueCode) => {
    const acceptance = acceptanceFixture();
    acceptance.interviewDecisions.push({
      questionId: "Q-003",
      category,
      question: "Safety boundary?",
      answer,
      answeredAt: "2026-08-28T10:05:00.000Z",
    });
    const draft = compileSafetyContract(acceptance);

    expect(draft.contractChecks.findings).toContainEqual(
      expect.objectContaining({ kind: "safety_boundary", severity: "blocking" }),
    );
    expect(issueCodes(draft)).toContain(issueCode);
  });

  it("blocks an unclarified production request", () => {
    const acceptance = acceptanceFixture();
    acceptance.request.originalPrompt = "Deploy the profile application to production";
    const draft = compileSafetyContract(acceptance);

    expect(issueCodes(draft)).toContain("blocking_decision_unresolved");
  });

  it("rejects sensitive actions with missing or disabled approval gates", () => {
    const missing = compileSafetyContract(acceptanceFixture());
    missing.safety.approvalRequired = [];
    expect(issueCodes(missing)).toContain("approval_required");

    const disabled = compileSafetyContract(acceptanceFixture());
    disabled.safety.plannedActions[0]!.requiresApproval = false;
    expect(issueCodes(disabled)).toContain("approval_required");
  });

  it("rejects missing baseline restrictions and duplicate finding IDs", () => {
    const draft = compileSafetyContract(acceptanceFixture());
    draft.safety.restrictedActions.shift();
    draft.contractChecks.findings.push({ ...draft.contractChecks.findings[0]! });

    expect(issueCodes(draft)).toEqual(
      expect.arrayContaining(["safety_restriction_missing", "duplicate_finding_id"]),
    );
  });

  it("carries Phase 5.2 semantic failures into safety validation", () => {
    const draft = compileSafetyContract(acceptanceFixture());
    draft.acceptance.criteria[0]!.requirementIds = ["REQ-999"];

    expect(issueCodes(draft)).toEqual(
      expect.arrayContaining(["unknown_requirement_reference", "required_requirement_uncovered"]),
    );
  });

  it("returns schema issues for malformed safety drafts", () => {
    const draft = compileSafetyContract(acceptanceFixture()) as SafetyContractDraft;
    draft.contractChecks.findings[0]!.sourceReferences = [];

    expect(issueCodes(draft)).toContain("schema_invalid");
  });
});
