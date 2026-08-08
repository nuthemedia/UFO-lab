import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextResponse } from "next/server";
import MiniSearch from "minisearch";

const fulltextIndexPath = resolve(process.cwd(), "data/shared/search/fulltext-index.json");
const bundlesPath = resolve(process.cwd(), "data/shared/pursue-document-bundles.json");
const translationsDir = resolve(process.cwd(), "data/shared/translations/ja");
const snippetHydrationLimit = 60;

type FulltextIndexItem = {
  id?: string;
  documentId: string;
  recordId: string;
  metadataText?: string;
  summaryText?: string;
  fullTextJa?: string;
  ocrTextEn?: string;
  snippetText?: string;
};

type FulltextIndexPayload = {
  version?: number;
  engine?: string;
  index?: unknown;
  documents?: FulltextIndexItem[];
};

const fields = ["metadataText", "summaryText", "fullTextJa", "ocrTextEn"];
const storeFields = ["recordId", "documentId"];

type SearchResult = {
  id: string;
  score?: number;
  match?: Record<string, string[]>;
  recordId?: string;
  documentId?: string;
};

type LoadedSearchIndex = {
  documents: FulltextIndexItem[];
  documentById: Map<string, FulltextIndexItem>;
  miniSearch: MiniSearch | null;
};

type PursueDocumentBundle = {
  ocr?: {
    ocrTextEn?: string;
  };
};

type TranslationDocument = {
  fullTextJa?: string;
};

let cachedSearchIndexPromise: Promise<LoadedSearchIndex> | null = null;
let cachedBundlesPromise: Promise<Record<string, PursueDocumentBundle>> | null = null;
const cachedTranslationPromises = new Map<string, Promise<TranslationDocument>>();

function normalizeSearchText(value: string) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\b(?:[A-Za-z]\.\s*){2,}/g, (match) => match.replace(/[\s.]/g, ""))
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{Letter}\p{Number}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々〆〤]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getJapaneseGrams(value: string) {
  const grams: string[] = [];
  const sequences = value.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々〆〤]+/gu) || [];

  for (const sequence of sequences) {
    if (sequence.length <= 4) {
      grams.push(sequence);
    }

    for (let size = 2; size <= 3; size += 1) {
      if (sequence.length < size) {
        continue;
      }

      for (let index = 0; index <= sequence.length - size; index += 1) {
        grams.push(sequence.slice(index, index + size));
      }
    }
  }

  return grams;
}

function tokenizeForRuppeltSearch(value: string) {
  const normalized = normalizeSearchText(value);
  const latinTokens = normalized.match(/[a-z0-9]+/g) || [];
  return [...latinTokens, ...getJapaneseGrams(normalized)].filter((token) => token.length > 1);
}

function makeSnippet(text: string, query: string) {
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  const index = haystack.indexOf(needle);

  if (index < 0) {
    return "";
  }

  const start = Math.max(0, index - 54);
  const end = Math.min(text.length, index + query.length + 74);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end)}${suffix}`.replace(/\s+/g, " ").trim();
}

function makeBestSnippet(document: FulltextIndexItem, query: string) {
  const fieldsByPriority = [
    document.snippetText || "",
    document.fullTextJa || "",
    document.ocrTextEn || "",
    document.summaryText || "",
  ];

  for (const text of fieldsByPriority) {
    const snippet = makeSnippet(text, query);

    if (snippet) {
      return snippet;
    }
  }

  return "";
}

async function loadBundles() {
  if (!cachedBundlesPromise) {
    cachedBundlesPromise = readFile(bundlesPath, "utf8")
      .then((content) => JSON.parse(content) as Record<string, PursueDocumentBundle>)
      .catch(() => ({}));
  }

  return cachedBundlesPromise;
}

async function loadTranslation(recordId: string) {
  if (!cachedTranslationPromises.has(recordId)) {
    cachedTranslationPromises.set(
      recordId,
      readFile(resolve(translationsDir, `${recordId}.json`), "utf8")
        .then((content) => JSON.parse(content) as TranslationDocument)
        .catch(() => ({})),
    );
  }

  return cachedTranslationPromises.get(recordId)!;
}

async function makeHydratedSnippet(document: FulltextIndexItem, query: string) {
  const fastSnippet = makeBestSnippet(document, query);

  if (fastSnippet) {
    return fastSnippet;
  }

  const [translation, bundles] = await Promise.all([loadTranslation(document.recordId), loadBundles()]);
  const bundle = bundles[document.recordId];
  const hydratedFields = [
    translation.fullTextJa || "",
    bundle?.ocr?.ocrTextEn || "",
  ];

  for (const text of hydratedFields) {
    const snippet = makeSnippet(text, query);

    if (snippet) {
      return snippet;
    }
  }

  return "";
}

async function loadSearchIndex() {
  if (!cachedSearchIndexPromise) {
    cachedSearchIndexPromise = readFile(fulltextIndexPath, "utf8")
      .then((content) => {
        const payload = JSON.parse(content) as FulltextIndexPayload | FulltextIndexItem[];
        const documents = Array.isArray(payload) ? payload : payload.documents || [];
        const documentById = new Map(documents.map((item) => [item.recordId, item]));
        let miniSearch: MiniSearch | null = null;

        if (!Array.isArray(payload) && payload.engine === "minisearch" && payload.index) {
          miniSearch = MiniSearch.loadJS(payload.index as Parameters<typeof MiniSearch.loadJS>[0], {
            fields,
            storeFields,
            idField: "id",
            tokenize: tokenizeForRuppeltSearch,
          });
        }

        return { documents, documentById, miniSearch };
      })
      .catch((error) => {
        cachedSearchIndexPromise = null;
        throw error;
      });
  }

  return cachedSearchIndexPromise;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json({ query, matches: [] });
  }

  try {
    const { documents, documentById, miniSearch } = await loadSearchIndex();
    let results: SearchResult[] = [];

    if (miniSearch) {
      const searchOptions: {
        prefix: boolean;
        fuzzy?: number;
        boost: Record<string, number>;
        combineWith: "AND";
      } = {
        prefix: true,
        boost: {
          metadataText: 3,
          summaryText: 2,
          fullTextJa: 1.5,
          ocrTextEn: 1.2,
        },
        combineWith: "AND",
      };

      if (query.length >= 5) {
        searchOptions.fuzzy = 0.12;
      }

      results = miniSearch.search(query, searchOptions) as SearchResult[];
    } else {
      const normalizedQuery = normalizeSearchText(query);
      results = documents
        .filter((item) =>
          normalizeSearchText(
            `${item.metadataText || ""}\n${item.summaryText || ""}\n${item.snippetText || ""}\n${item.fullTextJa || ""}\n${item.ocrTextEn || ""}`,
          ).includes(normalizedQuery),
        )
        .map((item) => ({
          id: item.recordId,
          recordId: item.recordId,
          documentId: item.documentId,
          score: 1,
        }));
    }

    const matches = await Promise.all(
      results.map(async (result, index) => {
        const recordId = result.recordId || result.id;
        const document = documentById.get(recordId);
        const snippet =
          document && index < snippetHydrationLimit
            ? await makeHydratedSnippet(document, query)
            : document
              ? makeBestSnippet(document, query)
              : "";

        return {
          documentId: result.documentId || document?.documentId || recordId,
          recordId,
          score: result.score || 0,
          matchedFields: result.match ? Array.from(new Set(Object.values(result.match).flat())) : [],
          snippet,
        };
      }),
    );

    return NextResponse.json({ query, matches });
  } catch (error) {
    console.error("Failed to search Ruppelt fulltext index:", error);
    return NextResponse.json({ error: "Fulltext search could not be loaded." }, { status: 500 });
  }
}
