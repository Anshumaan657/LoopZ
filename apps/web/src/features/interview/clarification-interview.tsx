"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import {
  interviewSessionSchema,
  type InterviewQuestion,
  type InterviewSession,
} from "@loopz/contracts/intake";
import type { IntakeAnalysis } from "@loopz/core/intake";
import {
  answerInterviewQuestion,
  createInterviewSession,
} from "@loopz/core/interview";

import { ActionRow, WorkflowGrid } from "../../components/workflow-layout";
import { WorkflowProgress } from "../../components/workflow-progress";

type AcceptedIntakeAnalysis = Extract<IntakeAnalysis, { valid: true }>;

type StoredProjectDraft = {
  projectId: string;
  createdAt: string;
  intake: {
    originalPrompt: string;
    mode: "guided" | "geek";
  };
  analysis: AcceptedIntakeAnalysis;
  interview?: InterviewSession;
};

type LoadedInterview = {
  draft: StoredProjectDraft;
  session: InterviewSession;
};

const textAnswerOptions: Partial<Record<InterviewQuestion["category"], string[]>> = {
  primary_flow: ["Complete the main user journey", "Improve an existing journey", "Help me decide"],
  roles_and_access: ["One public user type", "Signed-in users and admins", "Preserve existing roles"],
  authentication: ["Use the existing sign-in", "Email and password", "No sign-in for this version"],
  data_handling: ["Store only essential data", "Use the existing data model", "Do not persist data"],
  external_integrations: ["Use the existing integration", "Use a local mock", "Exclude the integration"],
  repository_context: ["Start a new project", "Use an existing repository and preserve its stack", "I’m not sure yet"],
  verification: ["Run existing tests and the production build", "Add automated tests for the changed flow", "Verify the flow in a browser"],
  scope: ["Build the smallest working version", "Include the complete described flow", "Help me narrow the scope"],
  visual_behavior: ["Use the existing design system", "Create a responsive monochrome interface", "Match a reference I will provide"],
};

type DisplayAnswerOption = { value: string; label: string; description?: string };

function quickAnswerOptions(question: InterviewQuestion): DisplayAnswerOption[] {
  if (question.answerKind === "choice") return question.options;
  return (textAnswerOptions[question.category] ?? [
    "Use the safest practical default",
    "Preserve the existing behavior",
    "Help me decide",
  ]).map((value) => ({ value, label: value }));
}

function persistInterview(draft: StoredProjectDraft, session: InterviewSession) {
  const updatedDraft = { ...draft, interview: session };
  localStorage.setItem(`loopz:project:${draft.projectId}`, JSON.stringify(updatedDraft));
  return updatedDraft;
}

export function ClarificationInterview({ projectId }: { projectId: string }) {
  const [loaded, setLoaded] = useState<LoadedInterview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [customAnswer, setCustomAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  useEffect(() => {
    const rawDraft = localStorage.getItem(`loopz:project:${projectId}`);
    if (!rawDraft) {
      setLoadError("This project draft was not found in this browser.");
      return;
    }

    try {
      const draft = JSON.parse(rawDraft) as StoredProjectDraft;
      if (
        draft.projectId !== projectId ||
        !draft.analysis?.valid ||
        draft.analysis.suitability === "unsupported"
      ) {
        setLoadError("This project does not contain a supported Phase 3 intake analysis.");
        return;
      }

      const savedSession = interviewSessionSchema.safeParse(draft.interview);
      const session = savedSession.success
        ? savedSession.data
        : createInterviewSession({ projectId, analysis: draft.analysis });
      const updatedDraft = persistInterview(draft, session);
      setLoaded({ draft: updatedDraft, session });
    } catch {
      setLoadError("The saved project draft is invalid. Start a new intake to continue.");
    }
  }, [projectId]);

  if (loadError) {
    return (
      <InterviewShell>
        <section className="interview-state-card interview-error" aria-live="polite">
          <span className="status-pill">Draft unavailable</span>
          <WorkflowProgress stage="Clarify" next="Review the execution contract" />
          <h1>LoopZ cannot open this interview.</h1>
          <p>{loadError}</p>
          <Link className="button" href="/projects/new">
            Start a new project
          </Link>
        </section>
      </InterviewShell>
    );
  }

  if (!loaded) {
    return (
      <InterviewShell>
        <section className="interview-state-card" aria-live="polite">
          <span className="status-pill">Loading</span>
          <WorkflowProgress stage="Clarify" next="Review the execution contract" />
          <h1>Preparing the smallest useful question set…</h1>
        </section>
      </InterviewShell>
    );
  }

  const { draft, session } = loaded;
  const currentQuestion = session.questions.find(
    (question) => question.id === session.currentQuestionId,
  );
  const progress =
    session.questions.length === 0
      ? 100
      : Math.round((session.answers.length / session.questions.length) * 100);

  function saveAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentQuestion) return;

    try {
      const sessionWithCustomOption =
        customAnswer && currentQuestion.answerKind === "choice"
          ? {
              ...session,
              questions: session.questions.map((question) =>
                question.id === currentQuestion.id
                  ? {
                      ...question,
                      options: [...question.options, { value: answer, label: answer }],
                    }
                  : question,
              ),
            }
          : session;
      const nextSession = answerInterviewQuestion(sessionWithCustomOption, answer);
      const nextDraft = persistInterview(draft, nextSession);
      setLoaded({ draft: nextDraft, session: nextSession });
      setAnswer("");
      setCustomAnswer(false);
      setAnswerError(null);
    } catch (error) {
      setAnswerError(error instanceof Error ? error.message : "The answer could not be saved.");
    }
  }

  function restartInterview() {
    if (!draft.analysis.valid || draft.analysis.suitability === "unsupported") return;
    const nextSession = createInterviewSession({ projectId, analysis: draft.analysis });
    const nextDraft = persistInterview(draft, nextSession);
    setLoaded({ draft: nextDraft, session: nextSession });
    setAnswer("");
    setCustomAnswer(false);
    setAnswerError(null);
  }

  return (
    <InterviewShell>
      <header className="interview-header">
        <div>
          <p className="eyebrow">Clarify the build</p>
          <WorkflowProgress stage="Clarify" next="Review and save the execution contract" />
          <h1>Resolve only what changes the outcome.</h1>
        </div>
        <div className="interview-budget">
          <strong>
            {session.answers.length}/{session.questions.length}
          </strong>
          <span>questions answered</span>
        </div>
      </header>

      <div className="interview-progress" aria-label={`${progress}% complete`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <WorkflowGrid className="interview-layout">
        {session.status === "in_progress" && currentQuestion ? (
          <form className="question-card" onSubmit={saveAnswer}>
            <div className="question-meta">
              <span>
                Question {session.answers.length + 1} of {session.questions.length}
              </span>
              <span>{currentQuestion.category.replaceAll("_", " ")}</span>
            </div>
            <h2>{currentQuestion.prompt}</h2>
            <fieldset className="answer-options">
              <legend>Choose the closest answer</legend>
              {quickAnswerOptions(currentQuestion).map((option) => (
                  <label
                    className={`answer-option ${!customAnswer && answer === option.value ? "selected" : ""}`}
                    key={option.value}
                  >
                    <input
                      checked={!customAnswer && answer === option.value}
                      name="answer"
                      onChange={() => { setCustomAnswer(false); setAnswer(option.value); }}
                      required
                      type="radio"
                      value={option.value}
                    />
                    <span>
                      <strong>{option.label}</strong>
                      {option.description ? <small>{option.description}</small> : null}
                    </span>
                  </label>
                ))}
              <label className={`answer-option ${customAnswer ? "selected" : ""}`}>
                <input
                  checked={customAnswer}
                  name="answer"
                  onChange={() => { setCustomAnswer(true); setAnswer(""); }}
                  type="radio"
                  value="custom"
                />
                <span><strong>Describe my answer</strong><small>Add context in your own words.</small></span>
              </label>
            </fieldset>

            {customAnswer ? (
              <div className="field-group">
                <label htmlFor="interview-answer">Describe your answer</label>
                <textarea
                  autoFocus
                  id="interview-answer"
                  maxLength={2000}
                  minLength={2}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={currentQuestion.placeholder}
                  required
                  rows={6}
                  value={answer}
                />
                <span className="answer-count">{answer.length}/2000</span>
              </div>
            ) : null}

            {answerError ? <p className="form-error">{answerError}</p> : null}

            <ActionRow
              disabledReason={!answer.trim() ? "Choose an answer or describe your own before continuing." : null}
              primary={<button className="button" disabled={!answer.trim()} type="submit">Save and continue</button>}
              stickyOnMobile
            />
          </form>
        ) : null}

        {session.status === "ready_for_contract" ? (
          <section className="interview-state-card interview-complete" aria-live="polite">
            <span className="status-pill">Clarification complete</span>
            <h2>The material decisions are ready for contract generation.</h2>
            <p>
              LoopZ asked {session.questions.length} question
              {session.questions.length === 1 ? "" : "s"} and stayed within the five-question
              budget.
            </p>

            {session.issues.length > 0 ? (
              <div className="interview-issues">
                {session.issues.map((issue) => (
                  <article key={`${issue.questionId}-${issue.message}`}>
                    <strong>
                      {issue.kind === "contradiction"
                        ? "Clarified scope change"
                        : issue.kind === "approval_gate"
                          ? "Approval required"
                          : "Safety boundary"}
                    </strong>
                    <p>{issue.message}</p>
                  </article>
                ))}
              </div>
            ) : null}

            <AnsweredSummary session={session} />
            <ActionRow
              destructive={<button className="button secondary" onClick={restartInterview} type="button">Answer again</button>}
              primary={<Link className="button" href={`/projects/${projectId}/contract`}>Review the execution contract</Link>}
            />
          </section>
        ) : null}

        {session.status === "blocked" ? (
          <section className="interview-state-card interview-error" aria-live="assertive">
            <span className="status-pill">Human action required</span>
            <h2>This project cannot continue safely yet.</h2>
            {session.issues
              .filter((issue) => issue.severity === "blocking")
              .map((issue) => (
                <p key={`${issue.questionId}-${issue.message}`}>{issue.message}</p>
              ))}
            <ActionRow
              back={<Link className="button secondary" href="/projects/new">Start a different project</Link>}
              primary={<button className="button" onClick={restartInterview} type="button">Correct my answer</button>}
            />
          </section>
        ) : null}
      </WorkflowGrid>
    </InterviewShell>
  );
}

function AnsweredSummary({ session }: { session: InterviewSession }) {
  if (session.answers.length === 0) return null;

  return (
    <details className="answered-summary">
      <summary>Review {session.answers.length} saved answers</summary>
      <ol>
        {session.answers.map((answer) => {
          const question = session.questions.find((item) => item.id === answer.questionId);
          const option = question?.options.find((item) => item.value === answer.value);
          return (
            <li key={answer.questionId}>
              <strong>{question?.prompt}</strong>
              <p>{option?.label ?? answer.value}</p>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

function InterviewShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="interview-page">{children}</main>
  );
}
