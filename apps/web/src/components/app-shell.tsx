import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="wordmark" href="/" aria-label="LoopZ home">LoopZ</Link>
          <nav aria-label="Primary navigation">
            <Link href="/about">About</Link>
            <Link className="nav-cta" href="/projects/new">Start a project</Link>
          </nav>
        </div>
      </header>
      <div className="app-content" id="main-content" tabIndex={-1}>{children}</div>
      <footer className="site-footer">
        <p>© 2026 LoopZ. All rights reserved.</p>
      </footer>
    </div>
  );
}
