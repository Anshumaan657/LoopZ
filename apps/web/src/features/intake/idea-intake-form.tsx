"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import {
  analyzeIdeaIntake,
  type IntakeAnalysis,
} from "@loopz/core/intake";

type IntakeMode = "guided" | "geek";
type ProjectStatus = "new" | "existing" | "unknown";

const taskTypeLabels = {
  new_web_application: "New web application",
  landing_page: "Landing page",
  existing_app_feature: "Existing-app feature",
  bug_fix: "Bug fix",
} as const;

function splitTechnologyPreferences(value: string): string[] {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function IdeaIntakeForm() {
  const [mode, setMode] = useState<IntakeMode>("guided");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("unknown");
  const [projectContext, setProjectContext] = useState("");
  const [technologyPreferences, setTechnologyPreferences] = useState("");
  const [analysis, setAnalysis] = useState<IntakeAnalysis | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  function submitIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const intake = {
      originalPrompt,
      mode,
      projectStatus: mode === "guided" ? "unknown" : projectStatus,
      projectContext: mode === "guided" ? "" : projectContext,
      technologyPreferences:
        mode === "guided" ? [] : splitTechnologyPreferences(technologyPreferences),
    } as const;
    const result = analyzeIdeaIntake(intake);

    setAnalysis(result);
    setProjectId(null);

    if (result.valid && result.suitability !== "unsupported") {
      const draftProjectId = crypto.randomUUID();
      const draft = {
        projectId: draftProjectId,
        createdAt: new Date().toISOString(),
        intake,
        analysis: result,
      };

      localStorage.setItem(`loopz:project:${draftProjectId}`, JSON.stringify(draft));
      setProjectId(draftProjectId);
    }
  }

  return (
    <div className="intake-layout">
      <form className="intake-form" onSubmit={submitIntake}>
        <fieldset className="mode-fieldset">
          <legend>How much control do you want?</legend>
          <div className="mode-grid">
            <label className={`mode-card ${mode === "guided" ? "selected" : ""}`}>
              <input
                checked={mode === "guided"}
                name="mode"
                onChange={() => setMode("guided")}
                type="radio"
                value="guided"
              />
              <span className="mode-kicker">Recommended</span>
              <strong>Guided</strong>
              <span>Explain the idea normally. LoopZ will help surface missing decisions.</span>
            </label>
            <label className={`mode-card ${mode === "geek" ? "selected" : ""}`}>
              <input
                checked={mode === "geek"}
                name="mode"
                onChange={() => setMode("geek")}
                type="radio"
                value="geek"
              />
              <span className="mode-kicker">More control</span>
              <strong>Geek</strong>
              <span>Add project status, repository context, and technology preferences.</span>
            </label>
          </div>
        </fieldset>

        <div className="field-group">
          <div className="field-heading">
            <label htmlFor="original-prompt">What do you want to build or change?</label>
            <span>{originalPrompt.length}/4000</span>
          </div>
          <textarea
            autoFocus
            id="original-prompt"
            maxLength={4000}
            minLength={20}
            onChange={(event) => setOriginalPrompt(event.target.value)}
            placeholder="For example: Add a customer feedback form to my existing Next.js app. Save submissions and show a clear success message."
            required
            rows={8}
            value={originalPrompt}
          />
          <p className="field-help">
            Write the request as you would normally send it to a coding agent. LoopZ keeps the
            original unchanged.
          </p>
        </div>

        {mode === "geek" ? (
          <section className="geek-panel" aria-label="Geek mode controls">
            <div className="field-group">
              <label htmlFor="project-status">Project status</label>
              <select
                id="project-status"
                onChange={(event) => setProjectStatus(event.target.value as ProjectStatus)}
                value={projectStatus}
              >
                <option value="unknown">Not sure yet</option>
                <option value="new">Starting a new project</option>
                <option value="existing">Changing an existing project</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="project-context">Repository or stack context</label>
              <textarea
                id="project-context"
                maxLength={2000}
                onChange={(event) => setProjectContext(event.target.value)}
                placeholder="Example: Existing Next.js App Router project using TypeScript and PostgreSQL."
                rows={4}
                value={projectContext}
              />
            </div>
            <div className="field-group">
              <label htmlFor="technology-preferences">Technology preferences</label>
              <textarea
                id="technology-preferences"
                onChange={(event) => setTechnologyPreferences(event.target.value)}
                placeholder="One per line or comma-separated, such as: TypeScript, existing design system"
                rows={3}
                value={technologyPreferences}
              />
            </div>
          </section>
        ) : null}

        <div className="intake-submit-row">
          <button className="button" type="submit">
            Analyze my idea
          </button>
          <span>Your request is analyzed locally in this Phase 3 build.</span>
        </div>
      </form>

      <aside className="intake-aside">
        <span className="aside-label">MVP boundary</span>
        <h2>Best for a focused web task.</h2>
        <ul className="support-list">
          <li>New web applications</li>
          <li>Landing pages</li>
          <li>Existing-app features</li>
          <li>Clearly bounded bug fixes</li>
        </ul>
        <p>
          Native mobile apps, games, regulated decision systems, and unsafe requests are not
          accepted in the MVP.
        </p>
      </aside>

      {analysis ? <IntakeResult analysis={analysis} projectId={projectId} /> : null}
    </div>
  );
}

function IntakeResult({
  analysis,
  projectId,
}: {
  analysis: IntakeAnalysis;
  projectId: string | null;
}) {
  if (!analysis.valid) {
    return (
      <section className="analysis-panel analysis-error" aria-live="polite">
        <span className="status-pill">Needs attention</span>
        <h2>We need a little more detail.</h2>
        <ul>
          {analysis.issues.map((issue) => (
            <li key={`${issue.path}-${issue.message}`}>{issue.message}</li>
          ))}
        </ul>
      </section>
    );
  }

  if (analysis.suitability === "unsupported") {
    return (
      <section className="analysis-panel analysis-error" aria-live="polite">
        <span className="status-pill">Outside MVP scope</span>
        <h2>This request should not continue to task generation.</h2>
        <ul>
          {analysis.rejectionReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p>Edit the request above or choose a focused web-project task.</p>
      </section>
    );
  }

  return (
    <section className="analysis-panel" aria-live="polite">
      <div className="analysis-heading">
        <div>
          <span className="status-pill">
            {analysis.suitability === "ready_for_interview"
              ? "Ready for interview"
              : "Clarification recommended"}
          </span>
          <h2>Here&apos;s what LoopZ understood.</h2>
        </div>
        <span className="task-type">
          {taskTypeLabels[analysis.intent.taskType.value]}
        </span>
      </div>

      <div className="analysis-grid">
        <article>
          <h3>Proposed goal</h3>
          <p>{analysis.intent.goal.value}</p>
          <small>{Math.round(analysis.intent.goal.confidence * 100)}% extraction confidence</small>
        </article>
        <article>
          <h3>Detected constraints</h3>
          {analysis.intent.constraints.length > 0 ? (
            <ul>
              {analysis.intent.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          ) : (
            <p>No explicit constraints detected.</p>
          )}
        </article>
      </div>

      <div className="missing-section">
        <h3>Decisions to clarify</h3>
        {analysis.missingInformation.length > 0 ? (
          <div className="missing-list">
            {analysis.missingInformation.map((item) => (
              <article key={`${item.category}-${item.reason}`}>
                <span>{item.category.replaceAll("_", " ")}</span>
                <p>{item.reason}</p>
                {item.blocking ? <strong>Blocking</strong> : <small>Can be confirmed next</small>}
              </article>
            ))}
          </div>
        ) : (
          <p>No material gaps were detected. The interview can confirm the extracted intent.</p>
        )}
      </div>

      <div className="analysis-actions">
        {projectId ? (
          <Link className="button" href={`/projects/${projectId}/interview`}>
            Continue to clarification
          </Link>
        ) : null}
        <button
          className="button secondary"
          onClick={() => document.getElementById("original-prompt")?.focus()}
          type="button"
        >
          Edit my idea
        </button>
      </div>
    </section>
  );
}
