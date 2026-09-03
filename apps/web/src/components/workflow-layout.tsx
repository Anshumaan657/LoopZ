import type { ReactNode } from "react";

import styles from "./workflow-layout.module.css";

export function WorkflowGrid({
  aside,
  children,
  className,
}: {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.grid} ${aside ? styles.split : styles.single} ${className ?? ""}`}>
      {aside ? <aside className={styles.secondary}>{aside}</aside> : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export function ActionRow({
  back,
  destructive,
  primary,
  disabledReason,
  stickyOnMobile = false,
}: {
  back?: ReactNode;
  destructive?: ReactNode;
  primary: ReactNode;
  disabledReason?: string | null;
  stickyOnMobile?: boolean;
}) {
  return (
    <div className={`${styles.actions} ${stickyOnMobile ? styles.sticky : ""}`}>
      <div className={styles.secondaryActions}>{back}{destructive}</div>
      <div className={styles.primaryAction}>
        {disabledReason ? <p role="status">{disabledReason}</p> : null}
        {primary}
      </div>
    </div>
  );
}
