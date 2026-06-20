import { describe, expect, it } from "vitest";
import {
  bayesianUpdate,
  bayesianUpdateMultiple,
  calculateDrakeN,
  calculateDrakeSampleCounts,
  calculateVisitProbability,
  clampProbability,
} from "./drakeMath";

describe("clampProbability", () => {
  it("keeps values in the 0 to 1 range", () => {
    expect(clampProbability(-0.2)).toBe(0);
    expect(clampProbability(0.42)).toBe(0.42);
    expect(clampProbability(1.8)).toBe(1);
  });

  it("treats non-finite values as 0", () => {
    expect(clampProbability(Number.NaN)).toBe(0);
    expect(clampProbability(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("calculateDrakeSampleCounts", () => {
  it("returns staged sample counts that increase with the relevant assumptions", () => {
    const cautious = calculateDrakeSampleCounts({
      planetAbundance: 0.2,
      lifeChance: 0.2,
      intelligenceChance: 0.2,
      civilizationLifetime: 0.2,
    });
    const optimistic = calculateDrakeSampleCounts({
      planetAbundance: 0.8,
      lifeChance: 0.8,
      intelligenceChance: 0.8,
      civilizationLifetime: 0.2,
    });

    expect(optimistic.planetHostingStarCount).toBeGreaterThan(cautious.planetHostingStarCount);
    expect(optimistic.estimatedPlanetCount).toBeGreaterThan(cautious.estimatedPlanetCount);
    expect(optimistic.lifeBearingPlanetCount).toBeGreaterThan(cautious.lifeBearingPlanetCount);
    expect(optimistic.intelligencePlanetCount).toBeGreaterThan(cautious.intelligencePlanetCount);
    expect(optimistic.communicationCivilizationCount).toBeGreaterThan(cautious.communicationCivilizationCount);
  });

  it("uses 1.6 planets per planet-hosting star for the display-only planet estimate", () => {
    const counts = calculateDrakeSampleCounts({
      planetAbundance: 0.5,
      lifeChance: 0.5,
      intelligenceChance: 0.5,
      civilizationLifetime: 0.5,
    });

    expect(counts.planetHostingStarCount).toBeCloseTo(50_000_000_000);
    expect(counts.estimatedPlanetCount).toBeCloseTo(80_000_000_000);
  });

  it("derives communication civilizations from the same intelligence planet count", () => {
    const shortLived = calculateDrakeSampleCounts({
      planetAbundance: 0.5,
      lifeChance: 0.5,
      intelligenceChance: 0.5,
      civilizationLifetime: 0,
    });
    const longLived = calculateDrakeSampleCounts({
      planetAbundance: 0.5,
      lifeChance: 0.5,
      intelligenceChance: 0.5,
      civilizationLifetime: 1,
    });

    expect(longLived.intelligencePlanetCount).toBeCloseTo(shortLived.intelligencePlanetCount);
    expect(longLived.communicationCivilizationCount).toBeGreaterThan(shortLived.communicationCivilizationCount);
    expect(longLived.communicationCivilizationCount).toBeCloseTo(longLived.intelligencePlanetCount * 0.001);
    expect(shortLived.communicationCivilizationCount).toBeCloseTo(shortLived.intelligencePlanetCount * 0.000001);
  });
});

describe("calculateDrakeN", () => {
  it("separates life, intelligence, and civilization signals", () => {
    const estimate = calculateDrakeN({
      planetAbundance: 0.8,
      lifeChance: 0.5,
      intelligenceChance: 0.25,
      civilizationLifetime: 0.1,
    });

    expect(estimate.lifeSignal).toBeCloseTo(0.4);
    expect(estimate.intelligenceSignal).toBeCloseTo(0.1);
    expect(estimate.civilizationSignal).toBeCloseTo(0.01);
    expect(estimate.civilizationCount).toBeCloseTo(calculateDrakeSampleCounts({
      planetAbundance: 0.8,
      lifeChance: 0.5,
      intelligenceChance: 0.25,
      civilizationLifetime: 0.1,
    }).communicationCivilizationCount);
    expect(estimate.existenceProbability).toBeCloseTo(1 - Math.exp(-estimate.civilizationCount));
  });

  it("derives existence probability from civilization count", () => {
    const zero = calculateDrakeN({
      planetAbundance: 0,
      lifeChance: 1,
      intelligenceChance: 1,
      civilizationLifetime: 1,
    });
    const small = calculateDrakeN({
      planetAbundance: 0.01,
      lifeChance: 0.01,
      intelligenceChance: 0.01,
      civilizationLifetime: 0.01,
    });
    const large = calculateDrakeN({
      planetAbundance: 1,
      lifeChance: 1,
      intelligenceChance: 1,
      civilizationLifetime: 1,
    });

    expect(zero.civilizationCount).toBe(0);
    expect(zero.existenceProbability).toBe(0);
    expect(small.existenceProbability).toBeGreaterThan(zero.existenceProbability);
    expect(large.existenceProbability).toBeGreaterThan(small.existenceProbability);
    expect(large.existenceProbability).toBeLessThanOrEqual(1);
  });
});

describe("calculateVisitProbability", () => {
  it("keeps existence and visit filters separate", () => {
    const visitProbability = calculateVisitProbability(0.5, {
      sameEra: 0.5,
      discoveredEarth: 0.5,
      travelCapability: 0.5,
      motivation: 0.5,
      observable: 0.5,
    });

    expect(visitProbability).toBeCloseTo(0.015625);
  });
});

describe("bayesianUpdate", () => {
  it("raises posterior when evidence is more likely under visit", () => {
    const result = bayesianUpdate(0.1, 0.8, 0.2);

    expect(result.likelihoodRatio).toBeCloseTo(4);
    expect(result.posterior).toBeGreaterThan(0.1);
  });

  it("does not break at edge probabilities", () => {
    expect(bayesianUpdate(1, 1, 0).posterior).toBeLessThanOrEqual(1);
    expect(bayesianUpdate(0, 0, 1).posterior).toBeGreaterThanOrEqual(0);
  });
});

describe("bayesianUpdateMultiple", () => {
  it("keeps posterior equal to prior when no evidence is selected", () => {
    const result = bayesianUpdateMultiple(0.12, []);

    expect(result.likelihoodRatio).toBe(1);
    expect(result.posterior).toBeCloseTo(0.12);
  });

  it("combines selected evidence likelihood ratios", () => {
    const result = bayesianUpdateMultiple(0.1, [
      { likelihoodIfVisit: 0.8, likelihoodIfNoVisit: 0.2 },
      { likelihoodIfVisit: 0.6, likelihoodIfNoVisit: 0.3 },
    ]);

    expect(result.likelihoodRatio).toBeCloseTo(8);
    expect(result.posterior).toBeGreaterThan(0.1);
  });

  it("handles extreme values without leaving the probability range", () => {
    const result = bayesianUpdateMultiple(1, [
      { likelihoodIfVisit: 1, likelihoodIfNoVisit: 0 },
      { likelihoodIfVisit: 0, likelihoodIfNoVisit: 1 },
    ]);

    expect(result.posterior).toBeGreaterThanOrEqual(0);
    expect(result.posterior).toBeLessThanOrEqual(1);
  });

  it("keeps ordinary mixed evidence updates modest", () => {
    const result = bayesianUpdateMultiple(0.001, [
      { likelihoodIfVisit: 0.55, likelihoodIfNoVisit: 0.5 },
      { likelihoodIfVisit: 0.64, likelihoodIfNoVisit: 0.44 },
    ]);

    expect(result.likelihoodRatio).toBeLessThan(2);
    expect(result.posterior).toBeLessThan(0.002);
  });
});
