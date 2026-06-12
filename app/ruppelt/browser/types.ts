import type { PriorDisclosureStatus } from "@/lib/pursue";

export type RuppeltViewMode = "carousel" | "list";
export type CardLanguage = "ja" | "en";
export type SearchMode = "description" | "fulltext";
export type DetailTab = "info" | "summary" | "fulltextJa" | "ocrTextEn" | "source";
export type PriorDisclosureFilter = PriorDisclosureStatus | "unreviewed" | "";

export type RuppeltFulltextMatch = {
  documentId: string;
  recordId: string;
  snippet: string;
  score?: number;
  matchedFields?: string[];
};

export type FulltextStatus = "idle" | "loading" | "success" | "error";

export type SearchState = {
  draftQuery: string;
  committedQuery: string;
  searchMode: SearchMode;
  fulltextStatus: FulltextStatus;
  fulltextMatches: RuppeltFulltextMatch[];
  fulltextMatchesQuery: string;
  fulltextError: string;
};

export type SearchAction =
  | { type: "hydrate"; query: string; searchMode: SearchMode }
  | { type: "editQuery"; query: string }
  | { type: "commitSearch" }
  | { type: "applyExampleSearch"; query: string }
  | { type: "clearSearch" }
  | { type: "changeSearchMode"; searchMode: SearchMode }
  | { type: "fulltextStart"; query: string }
  | { type: "fulltextSuccess"; query: string; matches: RuppeltFulltextMatch[] }
  | { type: "fulltextError"; query: string; error: string };

export type RuppeltDocumentDetail = {
  documentId: string;
  recordId: string;
  hasFullTextJa: boolean;
  hasOcrTextEn: boolean;
  officialUrl: string;
  summaryJa: string;
  summaryEn: string;
  fullTextJa: string;
  readableFullTextJa: string;
  ocrTextEn: string;
  noteJa: string;
  status: {
    translationJa?: string;
    summary?: string;
    humanReview?: string;
  } | null;
  document: {
    officialPdfUrl?: string;
    sourcePdfUrl?: string;
    documentStatus?: {
      ocr?: string;
      translationJa?: string;
      summary?: string;
      humanReview?: string;
    };
  } | null;
  ocrSource: {
    repo?: string;
    repoUrl?: string;
    filePath?: string;
    githubUrl?: string;
    fetchedAt?: string;
    license?: string;
    licenseUrl?: string;
  } | null;
};
