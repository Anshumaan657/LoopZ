import {
  contractReviewInputSchema,
  type ContractReviewInput,
} from "@loopz/contracts/review";
import {
  acceptanceContractDraftSchema,
  safetyContractDraftSchema,
  type SafetyContractDraft,
} from "@loopz/contracts/loopspec";

import {
  compileSafetyContract,
  validateSafetyContractDraft,
  type SafetyDraftValidation,
} from "./generation/compile-safety-contract";

function assertSameIds(label: string, existing: string[], edited: string[]) {
  if (
    existing.length !== edited.length ||
    existing.some((id, index) => id !== edited[index])
  ) {
    throw new Error(`${label} IDs and order cannot change during contract review.`);
  }
}

function reviewedDecision<T extends { value: string }>(
  original: T,
  value: string,
): T {
  if (original.value === value) return original;
  return {
    ...original,
    value,
    source: "user_provided",
    confidence: 1,
    explanation: "Edited by the user during contract review.",
    confirmedByUser: false,
  };
}

export function contractReviewInput(draftInput: SafetyContractDraft): ContractReviewInput {
  const draft = safetyContractDraftSchema.parse(draftInput);
  return contractReviewInputSchema.parse({
    goal: draft.objective.goal.value,
    deliverables: draft.objective.deliverables.map(({ id, description, priority }) => ({
      id,
      description,
      priority,
    })),
    includedScope: draft.scope.included.map(({ id, description }) => ({ id, description })),
    excludedScope: draft.scope.excluded.map(({ id, description }) => ({ id, description })),
    assumptions: draft.scope.assumptions.map((item) => item.value),
    criteria: draft.acceptance.criteria.map(
      ({ id, requirement, verificationMethod, requiredEvidence }) => ({
        id,
        requirement,
        verificationMethod,
        requiredEvidence,
      }),
    ),
    verificationCommands: draft.acceptance.verificationCommands,
  });
}

export function reviseSafetyContractDraft(
  draftInput: SafetyContractDraft,
  reviewInput: ContractReviewInput,
): { draft: SafetyContractDraft; validation: SafetyDraftValidation } {
  const draft = safetyContractDraftSchema.parse(draftInput);
  const review = contractReviewInputSchema.parse(reviewInput);

  assertSameIds(
    "Deliverable",
    draft.objective.deliverables.map((item) => item.id),
    review.deliverables.map((item) => item.id),
  );
  assertSameIds(
    "Included scope",
    draft.scope.included.map((item) => item.id),
    review.includedScope.map((item) => item.id),
  );
  assertSameIds(
    "Excluded scope",
    draft.scope.excluded.map((item) => item.id),
    review.excludedScope.map((item) => item.id),
  );
  assertSameIds(
    "Criterion",
    draft.acceptance.criteria.map((item) => item.id),
    review.criteria.map((item) => item.id),
  );

  const assumptions = review.assumptions.map((value, index) => {
    const original = draft.scope.assumptions[index];
    if (!original) {
      throw new Error("Assumptions cannot be added during the Phase 5.4 review.");
    }
    return reviewedDecision(original, value);
  });
  if (assumptions.length !== draft.scope.assumptions.length) {
    throw new Error("Assumptions cannot be added or removed during the Phase 5.4 review.");
  }

  const { safety: _safety, contractChecks: _checks, ...acceptanceFields } = draft;
  const editedAcceptance = acceptanceContractDraftSchema.parse({
    ...acceptanceFields,
    status: "acceptance_draft",
    objective: {
      goal: reviewedDecision(draft.objective.goal, review.goal),
      deliverables: draft.objective.deliverables.map((item, index) => {
        const edited = review.deliverables[index]!;
        return {
          ...item,
          description: edited.description,
          priority: edited.priority,
          provenance: reviewedDecision(item.provenance, edited.description),
        };
      }),
    },
    scope: {
      included: draft.scope.included.map((item, index) => {
        const edited = review.includedScope[index]!;
        return {
          ...item,
          description: edited.description,
          provenance: reviewedDecision(item.provenance, edited.description),
        };
      }),
      excluded: draft.scope.excluded.map((item, index) => {
        const edited = review.excludedScope[index]!;
        return {
          ...item,
          description: edited.description,
          provenance: reviewedDecision(item.provenance, edited.description),
        };
      }),
      assumptions,
    },
    acceptance: {
      criteria: draft.acceptance.criteria.map((item, index) => ({
        ...item,
        priority: review.deliverables.find((requirement) =>
          item.requirementIds.includes(requirement.id),
        )?.priority ?? item.priority,
        ...review.criteria[index],
      })),
      verificationCommands: review.verificationCommands,
    },
    pendingSections: ["safety", "limits", "final_report"],
  });

  const revised = compileSafetyContract(editedAcceptance);
  return { draft: revised, validation: validateSafetyContractDraft(revised) };
}
