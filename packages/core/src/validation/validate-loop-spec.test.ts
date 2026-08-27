import { readFileSync } from "node:fs";

import { loopSpecLiteSchema, type LoopSpecLite } from "@loopz/contracts";
import { describe, expect, it } from "vitest";

import { validateLoopSpec } from "./validate-loop-spec";

function validFixture(): LoopSpecLite {
  return loopSpecLiteSchema.parse(readFixture("valid-small-web-project.json"));
}

function readFixture(filename: string): unknown {
  return JSON.parse(
    readFileSync(
      new URL(`../../../../tests/fixtures/loopspec/${filename}`, import.meta.url),
      "utf8",
    ),
  );
}

function issueCodes(input: unknown): string[] {
  const result = validateLoopSpec(input);
  return result.valid ? [] : result.issues.map((issue) => issue.code);
}

describe("validateLoopSpec", () => {
  it("accepts a valid, fully traceable contract", () => {
    expect(validateLoopSpec(validFixture()).valid).toBe(true);
  });

  it("returns structured schema issues without an LLM", () => {
    const result = validateLoopSpec(readFixture("invalid-schema-missing-evidence.json"));

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]?.code).toBe("schema_invalid");
    }
  });

  it("rejects the checked-in semantic-conflict fixture predictably", () => {
    expect(issueCodes(readFixture("invalid-semantic-scope-conflict.json"))).toContain(
      "scope_conflict",
    );
  });

  it("rejects duplicate requirement and criterion IDs", () => {
    const fixture = validFixture();
    fixture.objective.deliverables[1]!.id = "REQ-001";
    fixture.acceptance.criteria[1]!.id = "AC-001";

    expect(issueCodes(fixture)).toEqual(
      expect.arrayContaining(["duplicate_requirement_id", "duplicate_criterion_id"]),
    );
  });

  it("rejects unknown and uncovered requirement mappings", () => {
    const fixture = validFixture();
    fixture.acceptance.criteria[2]!.requirementIds = ["REQ-999"];

    expect(issueCodes(fixture)).toEqual(
      expect.arrayContaining([
        "unknown_requirement_reference",
        "required_requirement_uncovered",
      ]),
    );
  });

  it("rejects direct included/excluded scope conflicts", () => {
    const fixture = validFixture();
    fixture.scope.excluded.push({
      id: "SCOPE-OUT-002",
      description: "Name, email, and message fields!",
      provenance: {
        value: "Name, email, and message fields!",
        source: "inferred",
        confidence: 0.5,
        explanation: "Conflict fixture",
        confirmedByUser: false,
      },
    });

    expect(issueCodes(fixture)).toContain("scope_conflict");
  });

  it("blocks unresolved high-risk decisions", () => {
    const fixture = validFixture();
    fixture.scope.unresolvedDecisions.push({
      id: "DEC-001",
      question: "Which production database should receive submissions?",
      risk: "high",
      blocking: true,
    });

    expect(issueCodes(fixture)).toContain("blocking_decision_unresolved");
  });

  it("requires approval for sensitive planned actions", () => {
    const fixture = validFixture();
    fixture.safety.plannedActions.push({
      action: "Create an account in a paid email service",
      category: "external_service",
      requiresApproval: false,
    });

    expect(issueCodes(fixture)).toContain("approval_required");
  });
});
