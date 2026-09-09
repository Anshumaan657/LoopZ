"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthGuard } from "../auth/auth-guard";
import { useAuth } from "../auth/auth-provider";
import { deleteProjectHistory, listProjectHistory, type ProjectHistoryEntry } from "./project-history";
import styles from "./history.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function HistoryPage() {
  return <AuthGuard><HistoryContent /></AuthGuard>;
}

function HistoryContent() {
  const { user, error } = useAuth();
  const [projects, setProjects] = useState<ProjectHistoryEntry[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setProjects(listProjectHistory(window.localStorage));
  }, []);

  function remove(projectId: string) {
    deleteProjectHistory(projectId);
    setProjects(listProjectHistory(window.localStorage));
    setDeleteTarget(null);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Private project history</p>
          <h1>Pick up exactly where you left off.</h1>
          <p>Signed in as {user?.email}. Every saved workflow remains connected to its contract, evidence, and repair state.</p>
        </div>
        <Link className="button" href="/projects/new">Start a new project</Link>
      </header>

      {error ? <p className={styles.syncWarning} role="status"><strong>Cloud sync needs attention.</strong> {error}</p> : null}

      {projects.length === 0 ? (
        <section className={styles.empty}>
          <p className="eyebrow">Nothing here yet</p>
          <h2>Your first rough idea starts the history.</h2>
          <p>LoopZ will preserve the original request, clarification, confirmed task, and returned proof as you move through the workflow.</p>
          <Link className="button" href="/projects/new">Go with your idea</Link>
        </section>
      ) : (
        <section className={styles.list} aria-label={`${projects.length} saved LoopZ projects`}>
          <div className={styles.listHeading}>
            <h2>Saved projects</h2>
            <span>{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
          </div>
          {projects.map((project) => (
            <article className={styles.item} key={project.projectId}>
              <div className={styles.itemMain}>
                <span className={styles.stage}>{project.stage}</span>
                <h3>{project.title}</h3>
                <p>Updated <time dateTime={project.updatedAt}>{formatDate(project.updatedAt)}</time></p>
              </div>
              <div className={styles.itemActions}>
                <Link className="button secondary" href={project.resumeHref}>Continue</Link>
                {deleteTarget === project.projectId ? (
                  <div className={styles.confirmDelete} role="group" aria-label={`Confirm deletion of ${project.title}`}>
                    <span>Delete this project everywhere?</span>
                    <button onClick={() => remove(project.projectId)} type="button">Delete</button>
                    <button onClick={() => setDeleteTarget(null)} type="button">Cancel</button>
                  </div>
                ) : (
                  <button className={styles.deleteButton} onClick={() => setDeleteTarget(project.projectId)} type="button">Delete</button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
