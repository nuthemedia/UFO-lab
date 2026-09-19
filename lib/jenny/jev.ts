import { experimental_evaluate as evaluate } from "ai";
import { JENNY_QUESTIONS } from "@/data/jenny/questions";
import { transformJevAnswers, type JennyAnswers } from "@/lib/jenny/transform";
import type { JennyAnalysisCore } from "@/lib/jenny/types";

export const JENNY_MODEL_ID = "typesafe-ai/jev" as const;
const JEV_TIMEOUT_MS = 20_000;

export async function analyzeJennyReport(reportText: string, anonymousUserId: string): Promise<JennyAnalysisCore> {
  const startedAt = performance.now();
  const result = await evaluate({
    model: JENNY_MODEL_ID,
    state: { reportText },
    questions: JENNY_QUESTIONS,
    maxRetries: 1,
    abortSignal: AbortSignal.timeout(JEV_TIMEOUT_MS),
    providerOptions: {
      gateway: {
        disallowPromptTraining: true,
        user: anonymousUserId,
        tags: ["app:jenny", "question-set:jev-ufo-v1"],
      },
    },
  });
  const durationMs = performance.now() - startedAt;

  return transformJevAnswers(result.answers as JennyAnswers, durationMs);
}
