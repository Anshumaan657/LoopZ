"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import {
  analyzeIdeaIntake,
  type IntakeAnalysis,
} from "@loopz/core/intake";

import { GooeyNav } from "../../components/gooey-nav";
import { ActionRow, WorkflowGrid } from "../../components/workflow-layout";
import { safeSetItem } from "../../lib/storage";

type IntakeMode = "guided" | "geek";
type ProjectStatus = "new" | "existing" | "unknown";

const modeItems = [
  { label: "Guided", href: "/projects/new?mode=guided" },
  { label: "Geek", href: "/projects/new?mode=geek" },
];

function splitTechnologyPreferences(value: string): string[] {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function IdeaIntakeForm({ initialMode = "guided" }: { initialMode?: IntakeMode }) {
  const [mode, setMode] = useState<IntakeMode>(initialMode);
  const [superGeek, setSuperGeek] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("unknown");
  const [projectContext, setProjectContext] = useState("");
  const [technologyPreferences, setTechnologyPreferences] = useState("");
  const [analysis, setAnalysis] = useState<IntakeAnalysis | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const syncMode = () => {
      const nextMode = new URLSearchParams(window.location.search).get("mode");
      setMode(nextMode === "geek" ? "geek" : "guided");
    };
    syncMode();
    window.addEventListener("popstate", syncMode);
    return () => window.removeEventListener("popstate", syncMode);
  }, []);

  function selectMode(nextMode: IntakeMode) {
    setMode(nextMode);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    window.history.pushState({}, "", url);
  }

  function submitIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (originalPrompt.trim().length < 20) {
      setPromptError("Add a little more detail—at least 20 characters—so LoopZ can preserve your intent.");
      promptRef.current?.focus();
      return;
    }
    setPromptError(null);
    setStorageError(null);

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

      try {
        safeSetItem(`loopz:project:${draftProjectId}`, JSON.stringify(draft));
        setProjectId(draftProjectId);
      } catch (cause) {
        setStorageError(cause instanceof Error ? cause.message : "The project could not be saved in this browser.");
      }
    }
  }

  return (
    <WorkflowGrid className="intake-layout">
      <form className="intake-form" noValidate onSubmit={submitIntake}>
        {promptError || storageError ? (
          <div className="form-error-summary" role="alert" tabIndex={-1}>
            <strong>{promptError ? "Check the highlighted field." : "This browser could not save the project."}</strong>
            <span>{promptError ?? storageError}</span>
          </div>
        ) : null}
        <section className="mode-selector" aria-labelledby="mode-selector-title">
          <div>
            <p className="eyebrow">Choose your setup</p>
            <h2 id="mode-selector-title">How much guidance would you like?</h2>
          </div>
          <GooeyNav
            items={modeItems}
            particleCount={8}
            particleDistances={[55, 8]}
            particleR={70}
            activeIndex={mode === "geek" ? 1 : 0}
            animationTime={450}
            timeVariance={150}
            onSelect={(index) => selectMode(index === 1 ? "geek" : "guided")}
          />
        </section>

        <p className="mode-description">
          {mode === "guided"
            ? "Guided keeps setup simple and asks only the decisions that can change the result."
            : "Geek gives you direct control over project context while keeping the same verified workflow."}
        </p>

        <div className="field-group">
          <div className="field-heading">
            <label htmlFor="original-prompt">What do you want to build or change?</label>
            <span>{originalPrompt.length}/4000</span>
          </div>
          <textarea
            id="original-prompt"
            aria-describedby={promptError ? "original-prompt-error" : undefined}
            aria-invalid={promptError ? true : undefined}
            maxLength={4000}
            minLength={20}
            onChange={(event) => {
              setOriginalPrompt(event.target.value);
              if (promptError) setPromptError(null);
              if (storageError) setStorageError(null);
            }}
            placeholder="For example: Add a customer feedback form to my existing Next.js app. Save submissions and show a clear success message."
            required
            ref={promptRef}
            rows={8}
            value={originalPrompt}
          />
          {promptError ? <p className="form-error" id="original-prompt-error" role="alert">{promptError}</p> : null}
        </div>

        {mode === "geek" ? (
          <section className="geek-panel" aria-label="Geek mode controls">
            <p className="geek-panel-title">Advanced project context</p>
            <div className="super-geek-row">
              <div>
                <strong>Super Geek</strong>
                <span>Use this when repository choices or stack constraints must change the generated task.</span>
              </div>
              <label className="switch">
                <input
                  checked={superGeek}
                  onChange={(event) => setSuperGeek(event.target.checked)}
                  type="checkbox"
                />
                <span aria-hidden="true" />
                <b>{superGeek ? "On" : "Off"}</b>
              </label>
            </div>
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
            {superGeek ? (
              <>
                <div className="field-group wide-field">
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
              </>
            ) : null}
          </section>
        ) : null}

        <ActionRow
          primary={<button className="button" type="submit">Go with your idea</button>}
          stickyOnMobile
        />
      </form>

      {analysis ? <IntakeResult analysis={analysis} projectId={projectId} /> : null}
    </WorkflowGrid>
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
          <p>{projectId ? <Link href={`/projects/${projectId}/interview`}>{analysis.missingInformation.length === 0 ? "Ready to confirm — no material decisions appear to be missing." : `Mostly clear — ${analysis.missingInformation.length} decision${analysis.missingInformation.length === 1 ? " needs" : "s need"} confirmation.`}</Link> : analysis.missingInformation.length === 0 ? "Ready to confirm — no material decisions appear to be missing." : `Mostly clear — ${analysis.missingInformation.length} decision${analysis.missingInformation.length === 1 ? " needs" : "s need"} confirmation.`}</p>
        </div>
      </div>

      <div className="analysis-grid">
        <article>
          <h3>Proposed goal</h3>
          <p>{analysis.intent.goal.value}</p>
          <small>
            {analysis.intent.goal.confidence >= 0.75
              ? "Strong match to your original wording"
              : "Needs confirmation during clarification"}
          </small>
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

      <ActionRow
        back={<button className="button secondary" onClick={() => document.getElementById("original-prompt")?.focus()} type="button">Edit my idea</button>}
        primary={projectId ? <Link className="button" href={`/projects/${projectId}/interview`}>Continue to clarification</Link> : <span />}
      />
    </section>
  );
}
