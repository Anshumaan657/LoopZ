import { describe, expect, it } from "vitest";

import {
  contractFoundationSchema,
  type AcceptanceContractDraft,
  type ContractFoundation,
} from "@loopz/contracts/loopspec";

import {
  compileAcceptanceContract,
  validateAcceptanceContractDraft,
} from "./compile-acceptance-contract";

function foundationFixture(): ContractFoundation {
  const decision = (value: string) => ({
    value,
    source: "user_provided" as const,
    confidence: 1,
    explanation: "Provided by the user.",
    confirmedByUser: true,
  });

  return contractFoundationSchema.parse({
    schemaVersion: "0.1",
    status: "foundation_draft",
    projectId: "11111111-1111-4111-8111-111111111111",
    compilation: {
      sourceInterviewUpdatedAt: "2026-08-28T10:03:00.000Z",
      compiledAt: "2026-08-28T10:03:00.000Z",
    },
    request: {
      originalPrompt: "Add profile settings to an existing application.",
      taskType: {
        value: "existing_app_feature",
        source: "inferred",
        confidence: 0.9,
        explanation: "Classified from the request.",
        confirmedByUser: false,
      },
    },
    objective: {
      goal: decision("Let users manage their profile safely"),
      deliverables: [
        {
          id: "REQ-001",
          description: "Responsive profile settings page",
          priority: "required",
          provenance: decision("Responsive profile settings page"),
        },
        {
          id: "REQ-002",
          description: "Persist the display name in the existing database",
          priority: "required",
          provenance: decision("Persist the display name in the existing database"),
        },
        {
          id: "REQ-003",
          description: "Integrate the profile update with an external identity API",
          priority: "required",
          provenance: decision("Integrate the profile update with an external identity API"),
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
      excluded: [],
      assumptions: [],
    },
    environment: {
      projectStatus: {
        value: "existing",
        source: "user_selected",
        confidence: 1,
        explanation: "Selected during intake.",
        confirmedByUser: true,
      },
      projectContext: decision("Existing Next.js repository using pnpm and TypeScript"),
      technologyPreferences: [decision("Preserve the existing stack")],
    },
    interviewDecisions: [
      {
        questionId: "Q-001",
        category: "verification",
        question: "How should completion be verified?",
        answer: "Run pnpm test and pnpm run build, then update and reload the profile.",
        answeredAt: "2026-08-28T10:03:00.000Z",
      },
    ],
    pendingSections: ["acceptance", "safety", "limits", "final_report"],
  });
}

function issueCodes(draft: unknown): string[] {
  const validation = validateAcceptanceContractDraft(draft);
  return validation.valid ? [] : validation.issues.map((issue) => issue.code);
}

describe("compileAcceptanceContract", () => {
  it("generates one stable, traceable criterion for every required requirement", () => {
    const foundation = foundationFixture();
    const draft = compileAcceptanceContract(foundation);

    expect(draft.status).toBe("acceptance_draft");
    expect(draft.acceptance.criteria.map((criterion) => criterion.id)).toEqual([
      "AC-001",
      "AC-002",
      "AC-003",
    ]);
    expect(draft.acceptance.criteria.map((criterion) => criterion.requirementIds)).toEqual([
      ["REQ-001"],
      ["REQ-002"],
      ["REQ-003"],
    ]);
    expect(draft.acceptance.criteria.every((criterion) => criterion.requiredEvidence.length >= 3)).toBe(
      true,
    );
    expect(validateAcceptanceContractDraft(draft)).toEqual({
      valid: true,
      value: draft,
      issues: [],
    });
    expect(draft.pendingSections).toEqual(["safety", "limits", "final_report"]);
  });

  it("preserves explicit user-confirmed commands without duplicates", () => {
    const draft = compileAcceptanceContract(foundationFixture());

    expect(draft.acceptance.verificationCommands).toEqual(["pnpm test", "pnpm run build"]);
    expect(draft.acceptance.criteria[0]?.verificationMethod).toContain(
      "Run pnpm test and pnpm run build",
    );
  });

  it.each<[string, string[]]>([
    ["Run go test ./...", ["go test ./..."]],
    ["Run go test ./... -race, then inspect the result.", ["go test ./... -race"]],
    ["Run python -m pytest tests/test_profile.py", ["python -m pytest tests/test_profile.py"]],
    ["Run python3 -m pytest tests/test_profile.py.", ["python3 -m pytest tests/test_profile.py"]],
    ["Run pytest tests/test_profile.py::test_save -q", ["pytest tests/test_profile.py::test_save -q"]],
    ["Run pytest check.py", ["pytest check.py"]],
    ["Run pytest and then inspect the profile.", ["pytest"]],
    ["Run cargo test then inspect the profile.", ["cargo test"]],
    ["Run npm test -- --runInBand", ["npm test -- --runInBand"]],
    ['Run pytest "tests/profile settings.py" -k "save or delete".', ['pytest "tests/profile settings.py" -k "save or delete"']],
    ["Run `npx playwright test tests/profile.spec.ts` and inspect the screenshots.", ["npx playwright test tests/profile.spec.ts"]],
    ["Run cargo test; npm run build; cargo test", ["cargo test", "npm run build"]],
    ["Run pytest tests/Profile.py && pytest tests/profile.py", ["pytest tests/Profile.py", "pytest tests/profile.py"]],
    ["```sh\npython -m pytest tests/test_profile.py\ngo test ./...\n```", ["python -m pytest tests/test_profile.py", "go test ./..."]],
  ])("extracts complete commands from %s", (answer, expected) => {
    const foundation = foundationFixture();
    foundation.interviewDecisions[0]!.answer = answer;

    const draft = compileAcceptanceContract(foundation);

    expect(draft.acceptance.verificationCommands).toEqual(expected);
    expect(draft.acceptance.criteria[0]?.verificationMethod).toContain(answer);
  });

  it("uses requirement-specific observable behavior and evidence", () => {
    const draft = compileAcceptanceContract(foundationFixture());
    const [interfaceCriterion, dataCriterion, integrationCriterion] = draft.acceptance.criteria;

    expect(interfaceCriterion?.requirement).toContain("mobile and desktop widths");
    expect(interfaceCriterion?.requiredEvidence).toContain(
      "Browser-check result or screenshots for REQ-001",
    );
    expect(dataCriterion?.requirement).toContain("remains after reload or re-query");
    expect(dataCriterion?.requiredEvidence).toContain(
      "Passing persistence and access-control test output for REQ-002",
    );
    expect(integrationCriterion?.requirement).toContain("unavailable or failed service");
  });

  it("infers repository-aware commands when no explicit command was confirmed", () => {
    const foundation = foundationFixture();
    foundation.interviewDecisions = [];
    foundation.environment.projectContext.value = "Existing Python FastAPI project using pytest";

    const first = compileAcceptanceContract(foundation);
    const second = compileAcceptanceContract(foundation);

    expect(first.acceptance.verificationCommands).toEqual(["pytest"]);
    expect(second).toEqual(first);
  });

  it("keeps prototype payment criteria non-transactional", () => {
    const foundation = foundationFixture();
    foundation.objective.deliverables = [
      {
        id: "REQ-001",
        description: "Payments: Non-functional prototype",
        priority: "required",
        provenance: {
          value: "Payments: Non-functional prototype",
          source: "user_provided",
          confidence: 1,
          explanation: "Clarified during the interview.",
          confirmedByUser: true,
        },
      },
    ];

    const draft = compileAcceptanceContract(foundation);

    expect(draft.acceptance.criteria[0]?.requirement).toContain(
      "without initiating a real transaction",
    );
  });

  it.each(["Payment mock checkout", "Payments: Non-functional prototype", "Simulated payments"])(
    "preserves prototype limits for %s",
    (description) => {
      const foundation = foundationFixture();
      foundation.objective.deliverables[0]!.description = description;
      const criterion = compileAcceptanceContract(foundation).acceptance.criteria[0]!;

      expect(criterion.requirement).toContain("without initiating a real transaction");
      expect(criterion.requiredEvidence[0]).toContain("success, cancellation, and failure-path");
    },
  );

  it.each(["Delete stored profile data", "Remove a saved profile", "Soft deletion of profile data"])(
    "verifies the requested deletion outcome for %s",
    (description) => {
      const foundation = foundationFixture();
      foundation.objective.deliverables[0]!.description = description;
      const criterion = compileAcceptanceContract(foundation).acceptance.criteria[0]!;

      expect(criterion.requirement).toContain("requested removal or retention outcome");
      expect(criterion.requirement).toContain("unrelated data is unchanged");
      expect(criterion.requirement).not.toContain("data remains");
      expect(criterion.verificationMethod).toContain("removal or retention outcome after reload");
      expect(criterion.requiredEvidence).toContain(
        "Passing deletion, retention, and unaffected-data test output for REQ-001",
      );
    },
  );

  it.each([
    "Show an error message for invalid form input",
    "Validate form input before saving data to the database",
  ])("does not confuse input validation with regression or persistence: %s", (description) => {
    const foundation = foundationFixture();
    foundation.objective.deliverables[0]!.description = description;
    const criterion = compileAcceptanceContract(foundation).acceptance.criteria[0]!;

    expect(criterion.requirement).toContain("invalid input shows an actionable error");
    expect(criterion.requirement).not.toContain("regression");
    expect(criterion.verificationMethod).toContain("test valid and invalid submissions");
    expect(criterion.requiredEvidence[0]).toContain("valid-input and invalid-input");
  });

  it("still requires regression evidence for an explicit bug fix", () => {
    const foundation = foundationFixture();
    foundation.request.taskType.value = "bug_fix";
    foundation.objective.deliverables[0]!.description = "Fix broken form validation";
    const criterion = compileAcceptanceContract(foundation).acceptance.criteria[0]!;

    expect(criterion.requirement).toContain("focused regression test");
    expect(criterion.requiredEvidence[0]).toContain("regression-test output");
  });

  it("reports duplicate IDs, unknown mappings, uncovered requirements, and priority conflicts", () => {
    const draft = compileAcceptanceContract(foundationFixture());
    draft.acceptance.criteria[1]!.id = "AC-001";
    draft.acceptance.criteria[1]!.requirementIds = ["REQ-999"];
    draft.acceptance.criteria[2]!.priority = "optional";

    expect(issueCodes(draft)).toEqual(
      expect.arrayContaining([
        "duplicate_criterion_id",
        "unknown_requirement_reference",
        "required_requirement_uncovered",
        "criterion_priority_mismatch",
      ]),
    );
  });

  it("rejects missing commands and missing evidence at the schema boundary", () => {
    const noCommands = compileAcceptanceContract(foundationFixture()) as AcceptanceContractDraft;
    noCommands.acceptance.verificationCommands = [];
    expect(issueCodes(noCommands)).toContain("schema_invalid");

    const noEvidence = compileAcceptanceContract(foundationFixture()) as AcceptanceContractDraft;
    noEvidence.acceptance.criteria[0]!.requiredEvidence = [];
    expect(issueCodes(noEvidence)).toContain("schema_invalid");
  });
});
