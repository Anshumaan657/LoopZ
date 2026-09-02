import { describe, expect, it } from "vitest";

import { safetyContractDraftSchema, type SafetyContractDraft } from "@loopz/contracts/loopspec";

import { contractReviewInput, reviseSafetyContractDraft } from "./review";

function fixture(): SafetyContractDraft {
  const decision = (value: string) => ({
    value,
    source: "user_provided" as const,
    confidence: 1,
    explanation: "Source value.",
    confirmedByUser: false,
  });
  return safetyContractDraftSchema.parse({
    schemaVersion: "0.1",
    status: "safety_draft",
    projectId: "11111111-1111-4111-8111-111111111111",
    compilation: {
      sourceInterviewUpdatedAt: "2026-09-01T10:00:00.000Z",
      compiledAt: "2026-09-01T10:00:00.000Z",
    },
    request: {
      originalPrompt: "Add profile settings to the existing application.",
      taskType: { ...decision("existing_app_feature"), confidence: 0.9 },
    },
    objective: {
      goal: decision("Let users update their profile"),
      deliverables: [
        {
          id: "REQ-001",
          description: "Profile settings form",
          priority: "required",
          provenance: decision("Profile settings form"),
        },
      ],
    },
    scope: {
      included: [
        {
          id: "SCOPE-IN-001",
          description: "Profile settings",
          provenance: decision("Profile settings"),
        },
      ],
      excluded: [
        {
          id: "SCOPE-OUT-001",
          description: "Avatar uploads",
          provenance: decision("Avatar uploads"),
        },
      ],
      assumptions: [decision("Use the existing design system")],
    },
    environment: {
      projectStatus: decision("existing"),
      projectContext: decision("Existing Next.js project"),
      technologyPreferences: [decision("Preserve the stack")],
    },
    interviewDecisions: [],
    acceptance: {
      criteria: [
        {
          id: "AC-001",
          requirementIds: ["REQ-001"],
          requirement: "Valid profile changes persist after reload.",
          verificationMethod: "Submit the form and reload the page.",
          requiredEvidence: ["Passing browser check"],
          priority: "required",
        },
      ],
      verificationCommands: ["npm test", "npm run build"],
    },
    safety: {
      restrictedActions: [
        "Do not expose, print, commit, or transmit credentials or secrets.",
        "Do not deploy to or modify production systems in the LoopZ MVP.",
        "Do not perform irreversible data deletion or destructive migrations without " +
          "human approval and a recovery plan.",
        "Do not initiate real financial transactions, purchases, or subscriptions without human approval.",
        "Do not call external services or send external communications beyond confirmed scope and approval gates.",
      ],
      approvalRequired: [],
      plannedActions: [],
    },
    contractChecks: { findings: [] },
    pendingSections: ["limits", "final_report"],
  });
}

describe("contract review", () => {
  it("creates plain editable input without mutating the draft", () => {
    const draft = fixture();
    const before = structuredClone(draft);
    const review = contractReviewInput(draft);

    expect(review.goal).toBe("Let users update their profile");
    expect(review.criteria[0]?.id).toBe("AC-001");
    expect(review.verificationCommands).toEqual(["npm test", "npm run build"]);
    expect(draft).toEqual(before);
  });

  it("applies edits, records review provenance, and regenerates safety", () => {
    const draft = fixture();
    const review = contractReviewInput(draft);
    review.goal = "Let members update their display name";
    review.deliverables[0]!.description = "Display-name settings form";
    review.deliverables[0]!.priority = "optional";
    review.includedScope[0]!.description = "Display-name settings";
    review.assumptions[0] = "Reuse the existing account components";
    review.criteria[0]!.requirement = "A valid display name persists after reload.";
    review.criteria[0]!.requiredEvidence = ["Browser result", "Test output"];
    review.verificationCommands = ["npm test"];

    const result = reviseSafetyContractDraft(draft, review);

    expect(result.validation.valid).toBe(true);
    expect(result.draft.objective.goal).toEqual(
      expect.objectContaining({
        value: "Let members update their display name",
        source: "user_provided",
        confirmedByUser: false,
      }),
    );
    expect(result.draft.objective.deliverables[0]?.priority).toBe("optional");
    expect(result.draft.acceptance.criteria[0]?.priority).toBe("optional");
    expect(result.draft.acceptance.verificationCommands).toEqual(["npm test"]);
  });

  it("surfaces a blocking scope contradiction introduced by editing", () => {
    const draft = fixture();
    const review = contractReviewInput(draft);
    review.excludedScope[0]!.description = "Profile settings";

    const result = reviseSafetyContractDraft(draft, review);

    expect(result.validation.valid).toBe(false);
    if (!result.validation.valid) {
      expect(result.validation.issues.map((issue) => issue.code)).toContain("scope_conflict");
    }
  });

  it("rejects ID reordering, additions, and empty evidence at the boundary", () => {
    const draft = fixture();
    const reordered = contractReviewInput(draft);
    reordered.deliverables[0]!.id = "REQ-999";
    expect(() => reviseSafetyContractDraft(draft, reordered)).toThrow(
      "Deliverable IDs and order cannot change",
    );

    const addedAssumption = contractReviewInput(draft);
    addedAssumption.assumptions.push("A new assumption");
    expect(() => reviseSafetyContractDraft(draft, addedAssumption)).toThrow(
      "Assumptions cannot be added",
    );

    const emptyEvidence = contractReviewInput(draft);
    emptyEvidence.criteria[0]!.requiredEvidence = [];
    expect(() => reviseSafetyContractDraft(draft, emptyEvidence)).toThrow();
  });
});
