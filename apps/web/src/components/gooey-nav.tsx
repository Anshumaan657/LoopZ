"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import styles from "./gooey-nav.module.css";

type GooeyNavItem = { label: string; href: string };

type GooeyNavProps = {
  items: GooeyNavItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  animationTime?: number;
  timeVariance?: number;
};

type Particle = { id: number; x: number; y: number; duration: number; color: string };

export function GooeyNav({
  items,
  activeIndex,
  onSelect,
  particleCount = 8,
  particleDistances = [55, 8],
  particleR = 70,
  animationTime = 450,
  timeVariance = 150,
}: GooeyNavProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const particleId = useRef(0);
  const [pill, setPill] = useState({ left: 4, width: 112 });
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const update = () => {
      const list = listRef.current;
      const item = itemRefs.current[activeIndex];
      if (!list || !item) return;
      setPill({ left: list.offsetLeft + item.offsetLeft, width: item.offsetWidth });
    };
    update();
    const observer = new ResizeObserver(update);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [activeIndex]);

  function activate(event: MouseEvent<HTMLAnchorElement>, index: number) {
    event.preventDefault();
    if (index === activeIndex) return;
    onSelect(index);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const innerDistance = Math.min(particleDistances[0], particleR);
    const next = Array.from({ length: particleCount }, (_, point) => {
      const angle = (Math.PI * 2 * point) / particleCount + (Math.random() - 0.5) * 0.18;
      const distance = innerDistance - Math.random() * particleDistances[1];
      return {
        id: particleId.current++,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * Math.min(distance, particleR / 2),
        duration: animationTime + Math.random() * timeVariance,
        color: point % 2 === 0 ? "#ffffff" : "#8a8a8a",
      };
    });
    setParticles(next);
    window.setTimeout(() => setParticles([]), animationTime + timeVariance + 50);
  }

  return (
    <div className={styles.container} style={{ "--gooey-time": `${animationTime}ms` } as CSSProperties}>
      <nav className={styles.nav} aria-label="Choose project setup mode">
        <span className={styles.pill} style={{ left: pill.left, width: pill.width }} aria-hidden="true" />
        <ul className={styles.list} ref={listRef}>
          {items.map((item, index) => (
            <li
              className={`${styles.item} ${index === activeIndex ? styles.active : ""}`}
              key={item.href}
              ref={(element) => { itemRefs.current[index] = element; }}
            >
              <a
                className={styles.link}
                href={item.href}
                aria-current={index === activeIndex ? "page" : undefined}
                onClick={(event) => activate(event, index)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span
        className={styles.particleLayer}
        style={{ left: pill.left + pill.width / 2, top: "50%" }}
        aria-hidden="true"
      >
        {particles.map((particle) => (
          <span
            className={styles.particle}
            key={particle.id}
            style={{
              "--particle-x": `${particle.x}px`,
              "--particle-y": `${particle.y}px`,
              "--particle-time": `${particle.duration}ms`,
              "--particle-color": particle.color,
            } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}
