import MiniSearch from "minisearch";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const bundlesPath = resolve(rootDir, "data/shared/pursue-document-bundles.json");
const translationsDir = resolve(rootDir, "data/shared/translations/ja");
const fulltextIndexPath = resolve(rootDir, "data/shared/search/fulltext-index.json");
const fulltextIndexDir = dirname(fulltextIndexPath);

const fields = ["metadataText", "summaryText", "fullTextJa", "ocrTextEn"];
const storeFields = ["recordId", "documentId"];
const snippetSourceMaxLength = 1600;
const routingBloomHashes = 4;

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\b(?:[A-Za-z]\.\s*){2,}/g, (match) => match.replace(/[\s.]/g, ""))
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{Letter}\p{Number}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々〆〤]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getJapaneseGrams(value) {
  const grams = [];
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

function tokenizeForRuppeltSearch(value) {
  const normalized = normalizeSearchText(value);
  const latinTokens = normalized.match(/[a-z0-9]+/g) || [];
  return Array.from(
    new Set([...latinTokens, ...getJapaneseGrams(normalized)].filter((token) => token.length > 1)),
  );
}

function readJson(path, fallback) {
  return readFile(path, "utf8")
    .then((content) => JSON.parse(content))
    .catch(() => fallback);
}

async function loadTranslations() {
  if (!existsSync(translationsDir)) {
    return new Map();
  }

  const files = await readdir(translationsDir);
  const entries = await Promise.all(
    files
      .filter((fileName) => /^pursue-\d{4}\.json$/.test(fileName))
      .map(async (fileName) => {
        const translation = await readJson(resolve(translationsDir, fileName), null);
        return [fileName.replace(/\.json$/, ""), translation];
      }),
  );

  return new Map(entries.filter(([, translation]) => translation));
}

function joinValues(values) {
  return values.filter(Boolean).join("\n");
}

function normalizeFullTextForIndex(value) {
  const seen = new Set();

  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .filter((line) => {
      if (!line) {
        return false;
      }

      if (/^(?:-{2,}\s*)?page\s+\d+(?:\s*-{2,})?$/i.test(line)) {
        return false;
      }

      const duplicateKey = normalizeSearchText(line);
      if (duplicateKey.length >= 12 && seen.has(duplicateKey)) {
        return false;
      }

      if (duplicateKey.length >= 12) {
        seen.add(duplicateKey);
      }

      return true;
    })
    .join("\n");
}

function compactOversizedTextForIndex(value) {
  const normalized = normalizeFullTextForIndex(value);

  if (normalized.length <= 120000) {
    return normalized;
  }

  return Array.from(new Set(normalizeSearchText(normalized).split(" ").filter(Boolean))).join(" ");
}

function hashRoutingTerm(value) {
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

function makeRoutingBloom(terms) {
  const targetBits = Math.max(1 << 14, terms.length * 6);
  const routingBloomBits = 2 ** Math.ceil(Math.log2(targetBits));
  const bytes = new Uint8Array(routingBloomBits / 8);

  for (const term of terms) {
    const [first, second] = hashRoutingTerm(term);

    for (let index = 0; index < routingBloomHashes; index += 1) {
      const bit = (first + Math.imul(index, second) + index * index) & (routingBloomBits - 1);
      bytes[bit >>> 3] |= 1 << (bit & 7);
    }
  }

  return {
    bits: routingBloomBits,
    hashes: routingBloomHashes,
    data: Buffer.from(bytes).toString("base64"),
  };
}

function makeSnippetSource(...values) {
  return values
    .filter(Boolean)
    .join("\n")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, snippetSourceMaxLength);
}

const recordsIndex = await readJson(recordsPath, { records: [] });
const bundles = await readJson(bundlesPath, {});
const translations = await loadTranslations();

const documents = recordsIndex.records.map((record) => {
  const recordId = record.source.id;
  const translation = translations.get(recordId) || {};
  const bundle = bundles[recordId] || {};
  const ocrTextEn = compactOversizedTextForIndex(bundle.ocr?.ocrTextEn || "");
  const fullTextJa = compactOversizedTextForIndex(translation.fullTextJa || "");
  const summaryJa = translation.summaryJa || "";
  const summaryEn = translation.summaryEn || "";

  return {
    id: recordId,
    recordId,
    documentId: translation.documentId || bundle.document?.documentId || recordId,
    releaseId: record.searchFacets?.releaseId || "release_01",
    metadataText: joinValues([
      record.source.assetFileName,
      record.ja?.assetFileNameJa,
      record.source.agency,
      record.ja?.agencyJa,
      record.source.release,
      record.ja?.releaseJa,
      record.source.incidentDate,
      record.source.incidentLocation,
      record.ja?.incidentLocationJa,
      record.source.documentType,
      record.ja?.documentTypeJa,
      record.source.description,
      record.ja?.descriptionJa,
      record.priorDisclosure?.labelJa,
    ]),
    summaryText: joinValues([summaryJa, summaryEn]),
    fullTextJa,
    ocrTextEn,
  };
});

const makeSnippetDocument = (document) => ({
  id: document.id,
  recordId: document.recordId,
  documentId: document.documentId,
  metadataText: document.metadataText,
  summaryText: document.summaryText,
  snippetText: makeSnippetSource(
    document.summaryText,
    document.fullTextJa,
    document.ocrTextEn,
  ),
});

const releaseGroups = Map.groupBy(documents, (document) => document.releaseId);
const shardPayloads = Array.from(releaseGroups.entries())
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([releaseId, shardDocuments]) => {
    const shardSearch = new MiniSearch({
      fields,
      storeFields,
      idField: "id",
      tokenize: tokenizeForRuppeltSearch,
    });
    shardSearch.addAll(shardDocuments);
    const serializedIndex = JSON.parse(JSON.stringify(shardSearch));

    return {
      releaseId,
      file: `fulltext-index.${releaseId}.json`,
      count: shardDocuments.length,
      routingBloom: makeRoutingBloom(serializedIndex.index.map(([term]) => term)),
      payload: {
        version: 4,
        engine: "minisearch",
        generatedAt: new Date().toISOString(),
        releaseId,
        fields,
        storeFields,
        index: serializedIndex,
        documents: shardDocuments.map(makeSnippetDocument),
      },
    };
  });

const payload = {
  version: 4,
  engine: "minisearch",
  generatedAt: new Date().toISOString(),
  fields,
  storeFields,
  shards: shardPayloads.map(({ releaseId, file, count, routingBloom }) => ({
    releaseId,
    file,
    count,
    routingBloom,
  })),
};

if (process.argv.includes("--check")) {
  const committed = await readJson(fulltextIndexPath, null);
  const withoutTimestamp = (value) => JSON.stringify({ ...value, generatedAt: null });

  if (!committed || withoutTimestamp(committed) !== withoutTimestamp(payload)) {
    console.error(
      "fulltext-index.json does not match its sources. Run `node scripts/build-pursue-search-index.mjs` and commit the result.",
    );
    process.exit(1);
  }

  for (const shard of shardPayloads) {
    const committedShard = await readJson(resolve(fulltextIndexDir, shard.file), null);

    if (!committedShard || withoutTimestamp(committedShard) !== withoutTimestamp(shard.payload)) {
      console.error(
        `${shard.file} does not match its sources. Run \`node scripts/build-pursue-search-index.mjs\` and commit the result.`,
      );
      process.exit(1);
    }
  }

  console.log(`fulltext-index.json is up to date (${documents.length} records).`);
} else {
  await writeFile(fulltextIndexPath, `${JSON.stringify(payload)}\n`);

  for (const shard of shardPayloads) {
    await writeFile(resolve(fulltextIndexDir, shard.file), `${JSON.stringify(shard.payload)}\n`);
  }

  console.log(`Built ${fulltextIndexPath}`);
  console.log(`Built ${shardPayloads.length} release shards.`);
  console.log(
    `Indexed ${documents.length} records, ` +
      `${Array.from(translations.values()).filter((translation) => String(translation.fullTextJa || "").trim()).length} ` +
      "Japanese full-text translations.",
  );
}
