"use client";

import { useEffect, useState } from "react";

type BrandChallenge = {
  title: string;
  description: string;
};

type BrandChallengesProps = {
  heading: string;
  challenges: readonly BrandChallenge[];
};

export function BrandChallenges({ heading, challenges }: BrandChallengesProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setIsMobile(media.matches);
      setActiveIndex(media.matches ? null : (current) => current ?? 0);
    };

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const desktopActiveIndex = activeIndex ?? 0;
  const activeChallenge = challenges[desktopActiveIndex] ?? challenges[0];
  const activeNumber = String(desktopActiveIndex + 1).padStart(2, "0");

  if (isMobile) {
    return (
      <section className="brand-challenges" aria-labelledby="brand-challenges-heading">
        <div className="brand-challenges-header">
          <p className="mission-label">Challenges</p>
          <h2 id="brand-challenges-heading">{heading}</h2>
        </div>
        <div className="brand-challenge-stack">
          {challenges.map((challenge, index) => {
            const number = String(index + 1).padStart(2, "0");
            const isActive = activeIndex === index;
            const panelId = `brand-challenge-panel-${number}`;

            return (
              <div className="brand-challenge-mobile-item" key={challenge.title}>
                <button
                  aria-controls={panelId}
                  aria-expanded={isActive}
                  className={isActive ? "brand-challenge-tab is-active" : "brand-challenge-tab"}
                  id={`brand-challenge-tab-${number}`}
                  onClick={() => setActiveIndex(isActive ? null : index)}
                  type="button"
                >
                  <span>{number}</span>
                  <strong>{challenge.title}</strong>
                </button>
                {isActive ? (
                  <article
                    aria-labelledby={`brand-challenge-tab-${number}`}
                    className="brand-challenge-panel brand-challenge-panel-mobile"
                    id={panelId}
                  >
                    <p className="brand-challenge-panel-number">{number}</p>
                    <h3>{challenge.title}</h3>
                    <p>{challenge.description}</p>
                  </article>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="brand-challenges" aria-labelledby="brand-challenges-heading">
      <div className="brand-challenges-header">
        <p className="mission-label">Challenges</p>
        <h2 id="brand-challenges-heading">{heading}</h2>
      </div>
      <div className="brand-challenge-grid">
        <div className="brand-challenge-tab-list" role="tablist" aria-label={heading}>
          {challenges.map((challenge, index) => {
            const number = String(index + 1).padStart(2, "0");
            const isActive = desktopActiveIndex === index;

            return (
              <button
                aria-controls="brand-challenge-panel"
                aria-selected={isActive}
                className={isActive ? "brand-challenge-tab is-active" : "brand-challenge-tab"}
                id={`brand-challenge-tab-${number}`}
                key={challenge.title}
                onClick={() => setActiveIndex(index)}
                role="tab"
                type="button"
              >
                <span>{number}</span>
                <strong>{challenge.title}</strong>
              </button>
            );
          })}
        </div>
        <article
          aria-labelledby={`brand-challenge-tab-${activeNumber}`}
          className="brand-challenge-panel"
          id="brand-challenge-panel"
          role="tabpanel"
        >
          <p className="brand-challenge-panel-number">{activeNumber}</p>
          <h3>{activeChallenge.title}</h3>
          <p>{activeChallenge.description}</p>
        </article>
      </div>
    </section>
  );
}
