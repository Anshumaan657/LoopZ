import { describe, expect, it } from "vitest";

import { loopSpecLiteSchema } from "./loopspec";

describe("loopSpecLiteSchema", () => {
  it("rejects criteria without required evidence", () => {
    const result = loopSpecLiteSchema.safeParse({
      schemaVersion: "0.1",
      request: { originalPrompt: "Build a feedback form", taskType: "small_web_project" },
      objective: { goal: "Collect feedback", deliverables: ["Feedback form"] },
      scope: {
        included: ["Submit feedback"],
        excluded: [],
        assumptions: [],
        unresolvedDecisions: [],
      },
      environment: {
        projectStatus: "new",
        projectContext: "",
        technologyPreferences: [],
      },
      workflow: { phases: ["plan", "implement", "verify", "repair"] },
      acceptance: {
        criteria: [
          {
            id: "AC-001",
            requirement: "Valid feedback can be submitted",
            verificationMethod: "Automated test",
            requiredEvidence: [],
            priority: "required",
          },
        ],
      },
      safety: { restrictedActions: [], approvalRequired: [] },
      limits: { maximumRepairAttempts: 2, stopWhen: ["Blocked"] },
      finalReport: { requiredFields: ["Test results"] },
    });

    expect(result.success).toBe(false);
  });
});
