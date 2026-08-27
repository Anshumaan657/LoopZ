# Five-Question Interview Script

## Purpose

Resolve only uncertainties that materially affect scope, architecture, risk, or verification. This is not an open-ended product-discovery workshop.

## Opening

> I saved your original request exactly as provided. I will ask no more than five questions. I will prioritize decisions that change what gets built, who can do what, how data is handled, and how we prove completion. If you do not know an answer, you may ask for a recommendation or leave it unresolved.

## Facilitator rules

- Ask one question at a time.
- Do not ask anything already answered clearly.
- Choose questions from `RISK_QUESTION_CATALOG.md`.
- Ask high-impact questions before preferences.
- Record the exact question and answer.
- Label recommendations as recommendations.
- Do not silently decide authentication, payments, privacy, production deployment, or destructive operations.
- Stop at five questions even if low-impact uncertainty remains.
- Show unresolved decisions explicitly in the scope summary.

## Question selection

Before each question:

1. List unresolved categories.
2. Estimate which answer would most change the contract.
3. Choose one category.
4. Ask the shortest plain-language question that resolves it.
5. Record whether the answer was participant-provided, participant-selected, recommended, or unresolved.

## Question log

### Question 1

- Category:
- Why this changes the outcome:
- Exact question:
- Exact answer:
- Decision source:
- Confidence:
- Confirmed by participant: `yes / no`

### Question 2

- Category:
- Why this changes the outcome:
- Exact question:
- Exact answer:
- Decision source:
- Confidence:
- Confirmed by participant: `yes / no`

### Question 3

- Category:
- Why this changes the outcome:
- Exact question:
- Exact answer:
- Decision source:
- Confidence:
- Confirmed by participant: `yes / no`

### Question 4

- Category:
- Why this changes the outcome:
- Exact question:
- Exact answer:
- Decision source:
- Confidence:
- Confirmed by participant: `yes / no`

### Question 5

- Category:
- Why this changes the outcome:
- Exact question:
- Exact answer:
- Decision source:
- Confidence:
- Confirmed by participant: `yes / no`

## Contradiction check

Review the original request and answers for conflicts such as:

- No accounts, but private user dashboards.
- No database, but permanent submission storage.
- No external services, but email or SMS delivery.
- No deployment, but a public production URL is required.
- No payments, but checkout is in scope.

Contradictions found:

Resolution:

## Stop check

- Question budget used:
- High-risk unresolved decisions:
- Low-risk assumptions:
- Safe to create draft scope: `yes / no`

If `no`, narrow or reject the task rather than exceeding the question budget without recording the protocol deviation.

## Plain-language confirmation script

> Here is what I understood. I will show what is included, what is excluded, which assumptions were made, and how completion will be checked. Please correct anything that changes the intended result. Technical wording can change later; the outcome and boundaries must be correct now.

## Confirmation outcome

- Confirmed without correction.
- Confirmed after correction.
- Participant requested more time.
- High-risk decision remains unresolved.
- Task narrowed.
- Task rejected.

Corrections:
