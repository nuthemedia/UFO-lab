export type DrakeInputs = {
  planetAbundance: number;
  lifeChance: number;
  intelligenceChance: number;
  civilizationLifetime: number;
};

export type VisitInputs = {
  sameEra: number;
  discoveredEarth: number;
  travelCapability: number;
  motivation: number;
  observable: number;
};

export type DrakeEstimate = {
  civilizationCount: number;
  existenceProbability: number;
  lifeSignal: number;
  intelligenceSignal: number;
  civilizationSignal: number;
  qualitativeLevel: "少ない" | "中くらい" | "多い";
};

export type DrakeSampleCounts = {
  planetHostingStarCount: number;
  estimatedPlanetCount: number;
  lifeBearingPlanetCount: number;
  intelligencePlanetCount: number;
  communicationCivilizationCount: number;
};

export type EvidenceLikelihood = {
  likelihoodIfVisit: number;
  likelihoodIfNoVisit: number;
};

const MIN_ODDS_PROBABILITY = 0.000001;
const MAX_ODDS_PROBABILITY = 0.999999;
export const DRAKE_SAMPLE_STAR_COUNT = 100_000_000_000;
export const AVERAGE_PLANETS_PER_PLANET_HOSTING_STAR = 1.6;

export function clampProbability(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function clampForOdds(value: number) {
  return Math.min(MAX_ODDS_PROBABILITY, Math.max(MIN_ODDS_PROBABILITY, clampProbability(value)));
}

function getCivilizationLifetimeFactor(value: number) {
  const minFactor = 0.000001;
  const maxFactor = 0.001;
  return minFactor * Math.pow(maxFactor / minFactor, clampProbability(value));
}

export function calculateDrakeN(inputs: DrakeInputs): DrakeEstimate {
  const planetAbundance = clampProbability(inputs.planetAbundance);
  const lifeChance = clampProbability(inputs.lifeChance);
  const intelligenceChance = clampProbability(inputs.intelligenceChance);
  const civilizationLifetime = clampProbability(inputs.civilizationLifetime);

  const lifeSignal = planetAbundance * lifeChance;
  const intelligenceSignal = lifeSignal * intelligenceChance;
  const civilizationSignal = intelligenceSignal * civilizationLifetime;
  const civilizationCount = calculateDrakeSampleCounts(inputs).communicationCivilizationCount;

  let qualitativeLevel: DrakeEstimate["qualitativeLevel"] = "少ない";
  if (civilizationCount >= 1000) {
    qualitativeLevel = "多い";
  } else if (civilizationCount >= 100) {
    qualitativeLevel = "中くらい";
  }

  return {
    civilizationCount,
    existenceProbability: clampProbability(1 - Math.exp(-civilizationCount)),
    lifeSignal,
    intelligenceSignal,
    civilizationSignal,
    qualitativeLevel,
  };
}

export function calculateDrakeSampleCounts(inputs: DrakeInputs): DrakeSampleCounts {
  const planetAbundance = clampProbability(inputs.planetAbundance);
  const lifeChance = clampProbability(inputs.lifeChance);
  const intelligenceChance = clampProbability(inputs.intelligenceChance);
  const civilizationLifetimeFactor = getCivilizationLifetimeFactor(inputs.civilizationLifetime);
  const planetHostingStarCount = DRAKE_SAMPLE_STAR_COUNT * planetAbundance;
  const estimatedPlanetCount = planetHostingStarCount * AVERAGE_PLANETS_PER_PLANET_HOSTING_STAR;
  const lifeBearingPlanetCount = estimatedPlanetCount * lifeChance;
  const intelligencePlanetCount = lifeBearingPlanetCount * intelligenceChance;
  const communicationCivilizationCount = intelligencePlanetCount * civilizationLifetimeFactor;

  return {
    planetHostingStarCount,
    estimatedPlanetCount,
    lifeBearingPlanetCount,
    intelligencePlanetCount,
    communicationCivilizationCount,
  };
}

export function calculateVisitProbability(existenceProbability: number, inputs: VisitInputs) {
  const visitFilter =
    clampProbability(inputs.sameEra) *
    clampProbability(inputs.discoveredEarth) *
    clampProbability(inputs.travelCapability) *
    clampProbability(inputs.motivation) *
    clampProbability(inputs.observable);

  return clampProbability(existenceProbability * visitFilter);
}

export function bayesianUpdate(prior: number, likelihoodIfVisit: number, likelihoodIfNoVisit: number) {
  const safePrior = clampForOdds(prior);
  const safeLikelihoodIfVisit = Math.max(MIN_ODDS_PROBABILITY, clampProbability(likelihoodIfVisit));
  const safeLikelihoodIfNoVisit = Math.max(MIN_ODDS_PROBABILITY, clampProbability(likelihoodIfNoVisit));
  const likelihoodRatio = safeLikelihoodIfVisit / safeLikelihoodIfNoVisit;
  const priorOdds = safePrior / (1 - safePrior);
  const posteriorOdds = priorOdds * likelihoodRatio;
  const posterior = posteriorOdds / (1 + posteriorOdds);

  return {
    likelihoodRatio,
    posterior: clampProbability(posterior),
  };
}

export function bayesianUpdateMultiple(prior: number, evidence: EvidenceLikelihood[]) {
  if (evidence.length === 0) {
    return {
      likelihoodRatio: 1,
      posterior: clampProbability(prior),
    };
  }

  const combinedLikelihoodRatio = evidence.reduce((ratio, item) => {
    const update = bayesianUpdate(0.5, item.likelihoodIfVisit, item.likelihoodIfNoVisit);
    return ratio * update.likelihoodRatio;
  }, 1);
  const safePrior = clampForOdds(prior);
  const priorOdds = safePrior / (1 - safePrior);
  const posteriorOdds = priorOdds * combinedLikelihoodRatio;
  const posterior = posteriorOdds / (1 + posteriorOdds);

  return {
    likelihoodRatio: combinedLikelihoodRatio,
    posterior: clampProbability(posterior),
  };
}
