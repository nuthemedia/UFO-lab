export type JennySignalGroup = "report" | "encounter" | "alternatives" | "evidence" | "fake";
export type JennySignalTone = "ice" | "sage" | "amber";
export type JennyCloseEncounterCode = "CE1" | "CE2" | "CE3" | "NONE";

export type JennyMicroSignal = {
  id: string;
  group: JennySignalGroup;
  label: string;
  value: number;
  max: number;
  tone: JennySignalTone;
};

export type JennyAnalysisSummary = {
  strangeness: number;
  reliability: number;
  closeEncounter: {
    code: JennyCloseEncounterCode;
    labelJa: string;
    fit: number;
  };
  trueUfo: number;
  evidenceStrength: number;
  fakeIndicators: number;
};

export type JennyAnalysisCore = {
  schemaVersion: "jenny-1";
  questionSetVersion: "jev-ufo-v1";
  questionCount: 20;
  durationMs: number;
  microSignals: JennyMicroSignal[];
  summary: JennyAnalysisSummary;
};

export type JennyAnalysisResponse = JennyAnalysisCore & {
  quota: {
    remainingToday: number;
    resetsAt: string;
  };
};

export type JennyErrorCode =
  | "INVALID_INPUT"
  | "INPUT_TOO_LONG"
  | "DAILY_LIMIT"
  | "INVALID_JEV_RESPONSE"
  | "SERVICE_UNAVAILABLE";

export type JennyErrorResponse = {
  error: string;
  code: JennyErrorCode;
  quota?: {
    remainingToday: number;
    resetsAt: string;
  };
};
