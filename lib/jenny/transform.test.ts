import { describe, expect, it } from "vitest";
import { JENNY_QUESTIONS } from "@/data/jenny/questions";
import { InvalidJevResponseError, probabilityToPercent, transformJevAnswers, type JennyAnswers } from "./transform";

function validAnswers(): JennyAnswers {
  const answers = Object.fromEntries(
    Object.entries(JENNY_QUESTIONS).map(([id, question]) => {
      if (question.type === "choice") {
        return [id, { type: "choice", choice: "CE2", probabilities: { CE1: 0.02, CE2: 0.94, CE3: 0.03, none: 0.01 } }];
      }
      if (question.type === "score") {
        const score = id === "strangeness" ? 4.35 : id === "reliability" ? 3.1 : id === "evidenceStrength" ? 1.9 : 1;
        return [id, { type: "score", score }];
      }
      const probability = id === "trueUfo" ? 0.78 : id === "fakeIndicators" ? 0.14 : 0.5;
      return [id, { type: "boolean", probability }];
    }),
  );
  return answers as JennyAnswers;
}

describe("Jenny Jev transformation", () => {
  it("maps direct Jev answers to the fixed public contract", () => {
    const result = transformJevAnswers(validAnswers(), 285.6);

    expect(result.questionCount).toBe(20);
    expect(result.durationMs).toBe(286);
    expect(result.microSignals).toHaveLength(20);
    expect(result.summary).toEqual({
      strangeness: 8.7,
      reliability: 6.2,
      closeEncounter: { code: "CE2", labelJa: "第二種接近遭遇", fit: 94 },
      trueUfo: 78,
      evidenceStrength: 38,
      fakeIndicators: 14,
    });
  });

  it("rejects missing answers and invalid ranges", () => {
    const answers = { ...validAnswers() } as Record<string, unknown>;
    delete answers.contradictions;
    expect(() => transformJevAnswers(answers as JennyAnswers, 100)).toThrow(InvalidJevResponseError);
    expect(() => probabilityToPercent(1.1)).toThrow(InvalidJevResponseError);
  });
});
