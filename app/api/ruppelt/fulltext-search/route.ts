import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextResponse } from "next/server";
import MiniSearch from "minisearch";

const fulltextIndexPath = resolve(process.cwd(), "data/shared/search/fulltext-index.json");

type FulltextIndexItem = {
  id?: string;
  documentId: string;
  recordId: string;
  metadataText?: string;
  summaryText?: string;
  fullTextJa?: string;
  ocrTextEn?: string;
};

type FulltextIndexPayload = {
  version?: number;
  engine?: string;
  index?: unknown;
  documents?: FulltextIndexItem[];
};

const fields = ["metadataText", "summaryText", "fullTextJa", "ocrTextEn"];
const storeFields = ["recordId", "documentId"];

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
    document.fullTextJa || "",
    document.ocrTextEn || "",
    document.summaryText || "",
    document.metadataText || "",
  ];

  for (const text of fieldsByPriority) {
    const snippet = makeSnippet(text, query);

    if (snippet) {
      return snippet;
    }
  }

  return "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  if (!query) {
    return NextResponse.json({ query, matches: [] });
  }

  try {
    const payload = JSON.parse(await readFile(fulltextIndexPath, "utf8")) as FulltextIndexPayload | FulltextIndexItem[];
    const documents = Array.isArray(payload) ? payload : payload.documents || [];
    const documentById = new Map(documents.map((item) => [item.recordId, item]));

    let results: Array<{
      id: string;
      score?: number;
      match?: Record<string, string[]>;
      recordId?: string;
      documentId?: string;
    }> = [];

    if (!Array.isArray(payload) && payload.engine === "minisearch" && payload.index) {
      const miniSearch = MiniSearch.loadJSON(JSON.stringify(payload.index), {
        fields,
        storeFields,
        idField: "id",
        tokenize: tokenizeForRuppeltSearch,
      });
      const searchOptions: {
        prefix: boolean;
        fuzzy?: number;
        boost: Record<string, number>;
        combineWith: "OR";
      } = {
        prefix: true,
        boost: {
          metadataText: 3,
          summaryText: 2,
          fullTextJa: 1.5,
          ocrTextEn: 1.2,
        },
        combineWith: "OR",
      };

      if (query.length >= 5) {
        searchOptions.fuzzy = 0.12;
      }

      results = miniSearch.search(query, searchOptions) as typeof results;
    } else {
      const normalizedQuery = normalizeSearchText(query);
      results = documents
        .filter((item) =>
          normalizeSearchText(
            `${item.metadataText || ""}\n${item.summaryText || ""}\n${item.fullTextJa || ""}\n${item.ocrTextEn || ""}`,
          ).includes(normalizedQuery),
        )
        .map((item) => ({
          id: item.recordId,
          recordId: item.recordId,
          documentId: item.documentId,
          score: 1,
        }));
    }

    const matches = results.map((result) => {
      const recordId = result.recordId || result.id;
      const document = documentById.get(recordId);

      return {
        documentId: result.documentId || document?.documentId || recordId,
        recordId,
        score: result.score || 0,
        matchedFields: result.match ? Array.from(new Set(Object.values(result.match).flat())) : [],
        snippet: document ? makeBestSnippet(document, query) : "",
      };
    });

    return NextResponse.json({ query, matches });
  } catch (error) {
    console.error("Failed to search Ruppelt fulltext index:", error);
    return NextResponse.json({ error: "Fulltext search could not be loaded." }, { status: 500 });
  }
}
