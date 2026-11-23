import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { NextResponse } from "next/server";
import MiniSearch from "minisearch";

const fulltextIndexPath = resolve(process.cwd(), "data/shared/search/fulltext-index.json");
const fulltextIndexDir = dirname(fulltextIndexPath);
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
  shards?: Array<{
    releaseId: string;
    file: string;
    count: number;
    routingBloom?: {
      bits: number;
      hashes: number;
      data: string;
    };
  }>;
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
  miniSearches: MiniSearch[];
};

type PursueDocumentBundle = {
  ocr?: {
    ocrTextEn?: string;
  };
};

type TranslationDocument = {
  fullTextJa?: string;
};

let cachedManifestPromise: Promise<FulltextIndexPayload | FulltextIndexItem[]> | null = null;
const cachedShardPromises = new Map<string, Promise<LoadedSearchIndex>>();
let cachedLegacyIndexPromise: Promise<LoadedSearchIndex> | null = null;
let cachedBundlesPromise: Promise<Record<string, PursueDocumentBundle>> | null = null;
const cachedTranslationPromises = new Map<string, Promise<TranslationDocument>>();
const resultCache = new Map<string, Array<{
  documentId: string;
  recordId: string;
  score: number;
  matchedFields: string[];
  snippet: string;
}>>();
const resultCacheLimit = 40;

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

    const size = 2;

    for (let index = 0; index <= sequence.length - size; index += 1) {
      grams.push(sequence.slice(index, index + size));
    }
  }

  return grams;
}

function tokenizeForRuppeltSearch(value: string) {
  const normalized = normalizeSearchText(value);
  const latinTokens = normalized.match(/[a-z0-9]+/g) || [];
  return Array.from(
    new Set([...latinTokens, ...getJapaneseGrams(normalized)].filter((token) => token.length > 1)),
  );
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

async function loadManifest() {
  if (!cachedManifestPromise) {
    cachedManifestPromise = readFile(fulltextIndexPath, "utf8")
      .then((content) => JSON.parse(content) as FulltextIndexPayload | FulltextIndexItem[])
      .catch((error) => {
        cachedManifestPromise = null;
        throw error;
      });
  }

  return cachedManifestPromise;
}

function loadPayload(payload: FulltextIndexPayload, documents = payload.documents || []) {
  const documentById = new Map(documents.map((item) => [item.recordId, item]));
  const miniSearches =
    payload.engine === "minisearch" && payload.index
      ? [
          MiniSearch.loadJS(payload.index as Parameters<typeof MiniSearch.loadJS>[0], {
            fields,
            storeFields,
            idField: "id",
            tokenize: tokenizeForRuppeltSearch,
          }),
        ]
      : [];

  return { documents, documentById, miniSearches };
}

async function loadShard(shard: NonNullable<FulltextIndexPayload["shards"]>[number]) {
  if (!cachedShardPromises.has(shard.releaseId)) {
    cachedShardPromises.set(
      shard.releaseId,
      readFile(resolve(fulltextIndexDir, shard.file), "utf8")
        .then((content) => loadPayload(JSON.parse(content) as FulltextIndexPayload))
        .catch((error) => {
          cachedShardPromises.delete(shard.releaseId);
          throw error;
        }),
    );
  }

  return cachedShardPromises.get(shard.releaseId)!;
}

async function loadSearchIndex(releaseId: string, query: string) {
  const payload = await loadManifest();

  if (!Array.isArray(payload) && payload.shards?.length) {
    const releaseShards = payload.shards.filter(
      (shard) => !releaseId || shard.releaseId === releaseId,
    );
    const selectedShards = releaseId ? releaseShards : selectSearchShards(releaseShards, query);
    const loadedShards = await Promise.all(selectedShards.map(loadShard));
    const documents = loadedShards.flatMap((item) => item.documents);

    return {
      documents,
      documentById: new Map(documents.map((item) => [item.recordId, item])),
      miniSearches: loadedShards.flatMap((item) => item.miniSearches),
    };
  }

  if (!cachedLegacyIndexPromise) {
    cachedLegacyIndexPromise = Promise.resolve(
      Array.isArray(payload)
        ? {
            documents: payload,
            documentById: new Map(payload.map((item) => [item.recordId, item])),
            miniSearches: [],
          }
        : loadPayload(payload),
    ).catch((error) => {
      cachedLegacyIndexPromise = null;
      throw error;
    });
  }

  return cachedLegacyIndexPromise;
}

function selectSearchShards(
  shards: NonNullable<FulltextIndexPayload["shards"]>,
  query: string,
) {
  const queryTokens = tokenizeForRuppeltSearch(query);

  if (!queryTokens.length || shards.some((shard) => !shard.routingBloom?.data)) {
    return shards;
  }

  const selected = shards.filter((shard) => {
    return queryTokens.every((token) => routingBloomMayContain(shard.routingBloom!, token));
  });

  // Prefix and fuzzy queries may not have an exact routing term. In that case,
  // search every shard so routing never turns a valid result into a false zero.
  return selected.length ? selected : shards;
}

const routingBloomBytes = new Map<string, Uint8Array>();

function hashRoutingTerm(value: string) {
  let first = 2166136261;
  let second = 5381;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    first ^= code;
    first = Math.imul(first, 16777619);
    second = Math.imul(second, 33) ^ code;
  }

  return [first >>> 0, (second >>> 0) || 1];
}

function routingBloomMayContain(
  bloom: NonNullable<NonNullable<FulltextIndexPayload["shards"]>[number]["routingBloom"]>,
  term: string,
) {
  let bytes = routingBloomBytes.get(bloom.data);

  if (!bytes) {
    bytes = Uint8Array.from(Buffer.from(bloom.data, "base64"));
    routingBloomBytes.set(bloom.data, bytes);
  }

  const [first, second] = hashRoutingTerm(term);

  for (let index = 0; index < bloom.hashes; index += 1) {
    const bit = (first + Math.imul(index, second) + index * index) & (bloom.bits - 1);
    if ((bytes[bit >>> 3] & (1 << (bit & 7))) === 0) {
      return false;
    }
  }

  return true;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();
  const requestedRelease = (url.searchParams.get("release") || "").trim();
  const releaseId = /^release_\d{2}$/.test(requestedRelease) ? requestedRelease : "";

  if (!query) {
    return NextResponse.json({ query, matches: [] });
  }

  const resultCacheKey = `${releaseId}\0${normalizeSearchText(query)}`;
  const cachedMatches = resultCache.get(resultCacheKey);

  if (cachedMatches) {
    resultCache.delete(resultCacheKey);
    resultCache.set(resultCacheKey, cachedMatches);
    return NextResponse.json({ query, matches: cachedMatches });
  }

  try {
    const { documents, documentById, miniSearches } = await loadSearchIndex(releaseId, query);
    let results: SearchResult[] = [];

    if (miniSearches.length) {
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

      results = miniSearches
        .flatMap((miniSearch) => miniSearch.search(query, searchOptions) as SearchResult[])
        .sort((left, right) => (right.score || 0) - (left.score || 0));
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

    resultCache.set(resultCacheKey, matches);
    if (resultCache.size > resultCacheLimit) {
      resultCache.delete(resultCache.keys().next().value || "");
    }

    return NextResponse.json({ query, matches });
  } catch (error) {
    console.error("Failed to search Ruppelt fulltext index:", error);
    return NextResponse.json({ error: "Fulltext search could not be loaded." }, { status: 500 });
  }
}
