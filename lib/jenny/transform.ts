import type { Experimental_EvaluationAnswer } from "ai";
import { JENNY_QUESTIONS, JENNY_QUESTION_SET_VERSION } from "@/data/jenny/questions";
import { JENNY_SIGNAL_DEFINITIONS } from "@/data/jenny/signals";
import type { JennyAnalysisCore, JennyCloseEncounterCode, JennyMicroSignal } from "@/lib/jenny/types";

export type JennyAnswers = {
  [K in keyof typeof JENNY_QUESTIONS]: Experimental_EvaluationAnswer<(typeof JENNY_QUESTIONS)[K]>;
};

export class InvalidJevResponseError extends Error {
  constructor() {
    super("Jev returned an invalid response.");
    this.name = "InvalidJevResponseError";
  }
}

const CE_LABELS: Record<"CE1" | "CE2" | "CE3" | "none", { code: JennyCloseEncounterCode; labelJa: string }> = {
  CE1: { code: "CE1", labelJa: "第一種接近遭遇" },
  CE2: { code: "CE2", labelJa: "第二種接近遭遇" },
  CE3: { code: "CE3", labelJa: "第三種接近遭遇" },
  none: { code: "NONE", labelJa: "近接遭遇に該当せず" },
};

function assertFiniteRange(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new InvalidJevResponseError();
  }
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function normalizeScore(score: number, highestIndex: number, max: number, digits = 0) {
  assertFiniteRange(score, 0, highestIndex);
  return round((score / highestIndex) * max, digits);
}

export function probabilityToPercent(probability: number) {
  assertFiniteRange(probability, 0, 1);
  return round(probability * 100);
}

function signalValue(id: keyof typeof JENNY_QUESTIONS, answer: JennyAnswers[keyof JennyAnswers]) {
  const question = JENNY_QUESTIONS[id];

  if (question.type === "score") {
    if (answer.type !== "score") throw new InvalidJevResponseError();
    const max = id === "reliability" || id === "strangeness" ? 10 : 100;
    const digits = max === 10 ? 1 : 0;
    return normalizeScore(answer.score, question.criteria.length - 1, max, digits);
  }

  if (question.type === "boolean") {
    if (answer.type !== "boolean") throw new InvalidJevResponseError();
    return probabilityToPercent(answer.probability);
  }

  if (answer.type !== "choice" || !answer.probabilities) throw new InvalidJevResponseError();
  const probability = answer.probabilities[answer.choice];
  return probabilityToPercent(probability);
}

export function transformJevAnswers(answers: JennyAnswers, durationMs: number): JennyAnalysisCore {
  const answerKeys = Object.keys(answers);
  if (answerKeys.length !== JENNY_SIGNAL_DEFINITIONS.length) throw new InvalidJevResponseError();
  assertFiniteRange(durationMs, 0, Number.MAX_SAFE_INTEGER);

  const microSignals: JennyMicroSignal[] = JENNY_SIGNAL_DEFINITIONS.map((definition) => {
    const answer = answers[definition.id];
    if (!answer) throw new InvalidJevResponseError();

    return {
      ...definition,
      value: signalValue(definition.id, answer),
    };
  });

  const closeEncounter = answers.closeEncounter;
  if (closeEncounter.type !== "choice" || !closeEncounter.probabilities) throw new InvalidJevResponseError();
  const ce = CE_LABELS[closeEncounter.choice];
  if (!ce) throw new InvalidJevResponseError();

  return {
    schemaVersion: "jenny-1",
    questionSetVersion: JENNY_QUESTION_SET_VERSION,
    questionCount: 20,
    durationMs: Math.round(durationMs),
    microSignals,
    summary: {
      strangeness: signalValue("strangeness", answers.strangeness),
      reliability: signalValue("reliability", answers.reliability),
      closeEncounter: {
        ...ce,
        fit: probabilityToPercent(closeEncounter.probabilities[closeEncounter.choice]),
      },
      trueUfo: signalValue("trueUfo", answers.trueUfo),
      evidenceStrength: signalValue("evidenceStrength", answers.evidenceStrength),
      fakeIndicators: signalValue("fakeIndicators", answers.fakeIndicators),
    },
  };
}
