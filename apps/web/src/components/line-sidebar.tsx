"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";

import styles from "./line-sidebar.module.css";

type LineSidebarProps = {
  items: readonly string[];
  currentStep: number;
  furthestStep: number;
  onItemClick: (index: number) => void;
};

export function LineSidebar({ items, currentStep, furthestStep, onItemClick }: LineSidebarProps) {
  const [effects, setEffects] = useState<number[]>(() => items.map(() => 0));

  function trackPointer(event: PointerEvent<HTMLOListElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const buttons = [...event.currentTarget.querySelectorAll("button")];
    setEffects(buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      const distance = Math.abs(event.clientY - (rect.top + rect.height / 2));
      const proximity = Math.max(0, 1 - distance / 80);
      return proximity * proximity * (3 - 2 * proximity);
    }));
  }

  return (
    <nav className={styles.sidebar} aria-label="Contract review steps">
      <ol
        className={styles.list}
        onPointerMove={trackPointer}
        onPointerLeave={() => setEffects(items.map(() => 0))}
      >
        {items.map((item, index) => (
          <li className={styles.item} key={item}>
            <button
              className={styles.button}
              disabled={index > furthestStep}
              aria-current={index === currentStep ? "step" : undefined}
              onClick={() => onItemClick(index)}
              style={{ "--effect": Math.max(effects[index] ?? 0, index === currentStep ? 1 : 0) } as CSSProperties}
              type="button"
            >
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span>{item}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
