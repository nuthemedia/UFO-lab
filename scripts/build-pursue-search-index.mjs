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

const fields = ["metadataText", "summaryText", "fullTextJa", "ocrTextEn"];
const storeFields = ["recordId", "documentId"];
const snippetSourceMaxLength = 1600;

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

function tokenizeForRuppeltSearch(value) {
  const normalized = normalizeSearchText(value);
  const latinTokens = normalized.match(/[a-z0-9]+/g) || [];
  return [...latinTokens, ...getJapaneseGrams(normalized)].filter((token) => token.length > 1);
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
  const ocrTextEn = bundle.ocr?.ocrTextEn || "";
  const fullTextJa = translation.fullTextJa || "";
  const summaryJa = translation.summaryJa || "";
  const summaryEn = translation.summaryEn || "";

  return {
    id: recordId,
    recordId,
    documentId: translation.documentId || bundle.document?.documentId || recordId,
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

const miniSearch = new MiniSearch({
  fields,
  storeFields,
  idField: "id",
  tokenize: tokenizeForRuppeltSearch,
});

miniSearch.addAll(documents);

const snippetDocuments = documents.map((document) => ({
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
}));

const payload = {
  version: 3,
  engine: "minisearch",
  generatedAt: new Date().toISOString(),
  fields,
  storeFields,
  index: JSON.parse(JSON.stringify(miniSearch)),
  documents: snippetDocuments,
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

  console.log(`fulltext-index.json is up to date (${documents.length} records).`);
} else {
  await writeFile(fulltextIndexPath, `${JSON.stringify(payload)}\n`);

  console.log(`Built ${fulltextIndexPath}`);
  console.log(`Indexed ${documents.length} records, ${translations.size} Japanese full-text translations.`);
}
