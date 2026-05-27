"use client";

import { useState } from "react";

type BrandChallenge = {
  title: string;
  description: string;
};

type BrandChallengesProps = {
  heading: string;
  challenges: readonly BrandChallenge[];
};

export function BrandChallenges({ heading, challenges }: BrandChallengesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeChallenge = challenges[activeIndex] ?? challenges[0];
  const activeNumber = String(activeIndex + 1).padStart(2, "0");

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
            const isActive = activeIndex === index;

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
