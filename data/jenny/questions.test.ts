import { describe, expect, it } from "vitest";
import calibrationCases from "./calibration-cases.json";
import { JENNY_QUESTIONS } from "./questions";
import { JENNY_SIGNAL_DEFINITIONS } from "./signals";

describe("Jenny question set", () => {
  it("contains exactly 20 unique typed questions", () => {
    const questionIds = Object.keys(JENNY_QUESTIONS);
    const signalIds = JENNY_SIGNAL_DEFINITIONS.map((signal) => signal.id);

    expect(questionIds).toHaveLength(20);
    expect(new Set(questionIds).size).toBe(20);
    expect(signalIds).toEqual(questionIds);
    expect(Object.values(JENNY_QUESTIONS).every((question) => ["choice", "score", "boolean"].includes(question.type))).toBe(true);
  });

  it("keeps six direct summary questions inside the 20 questions", () => {
    const primaryIds = ["strangeness", "reliability", "closeEncounter", "trueUfo", "evidenceStrength", "fakeIndicators"];
    expect(primaryIds.every((id) => id in JENNY_QUESTIONS)).toBe(true);
  });

  it("ships 30 unique calibration cases that pass the input minimum", () => {
    expect(calibrationCases).toHaveLength(30);
    expect(new Set(calibrationCases.map((item) => item.id)).size).toBe(30);
    expect(calibrationCases.every((item) => item.reportText.trim().length >= 100)).toBe(true);
  });
});
