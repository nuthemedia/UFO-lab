"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./clark.module.css";

export function ClarkScrollMotion({
  children,
  onActiveSceneChange,
}: {
  children: ReactNode;
  onActiveSceneChange?: (index: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    root.classList.add(styles.storyMotionReady);
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-clark-scene]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => {
        target.classList.add("isVisible", "isActive");
      });
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            element.classList.add("isVisible");
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.18 },
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          targets.forEach((target) => target.classList.remove("isActive"));
          (entry.target as HTMLElement).classList.add("isActive");
          const index = targets.indexOf(entry.target as HTMLElement);

          if (index >= 0) {
            onActiveSceneChange?.(index + 1);
          }
        });
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: 0.1 },
    );

    targets.forEach((target) => {
      revealObserver.observe(target);
      activeObserver.observe(target);
    });

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [onActiveSceneChange]);

  return <div ref={rootRef}>{children}</div>;
}
