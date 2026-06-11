"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function RuppeltLpMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("ruppelt-lp-motion-ready");

    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const sectionTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-section]"));

    const setSectionState = (activeOrder: number) => {
      sectionTargets.forEach((target, index) => {
        target.classList.toggle("is-active", index === activeOrder);
        target.classList.toggle("is-past", index < activeOrder);
        target.classList.toggle("is-next", index > activeOrder);
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      sectionTargets.forEach((target) => target.classList.add("is-active"));
      root.style.setProperty("--ruppelt-scroll-progress", "1");
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 },
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const order = sectionTargets.indexOf(entry.target as HTMLElement);

          if (order >= 0) {
            setSectionState(order);
            window.requestAnimationFrame(updateScrollProgress);
          }
        });
      },
      { rootMargin: "-28% 0px -48% 0px", threshold: 0.08 },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
    sectionTargets.forEach((target) => sectionObserver.observe(target));
    setSectionState(0);

    let ticking = false;

    const updateScrollProgress = () => {
      ticking = false;
      const activeTarget =
        sectionTargets.find((target) => target.classList.contains("is-active")) ?? sectionTargets[0];

      if (!activeTarget) {
        return;
      }

      const rect = activeTarget.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const travel = Math.max(1, rect.height - viewportHeight * 0.35);
      const rawProgress = (viewportHeight * 0.72 - rect.top) / travel;
      const progress = Math.min(1, Math.max(0, rawProgress));
      root.style.setProperty("--ruppelt-scroll-progress", progress.toFixed(3));
    };

    const requestProgressUpdate = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, []);

  return (
    <div className="ruppelt-lp-motion" ref={rootRef}>
      {children}
    </div>
  );
}
