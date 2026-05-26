import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const sourceRoot = resolve(process.env.BPSAI_PURSUIT_INDEX_DIR || "/private/tmp/bpsai-pursue-index");
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const documentsDir = resolve(rootDir, "data/shared/pursue-documents");
const ocrDir = resolve(rootDir, "data/shared/ocr");
const reportsDir = resolve(rootDir, "data/shared/import-reports");
const manifestPath = resolve(sourceRoot, "data/manifests/latest.json");
const preferPreCleanup = process.argv.includes("--pre-cleanup");

const sourceRepo = "BPSAI/pursue-index";
const sourceRepoUrl = `https://github.com/${sourceRepo}`;
const sourceLicense =
  "PURSUE source documents are U.S. Government works; source project states mechanically generated OCR transcripts carry no additional copyright claim. Project code is Apache-2.0.";
const sourceLicenseUrl = `${sourceRepoUrl}/blob/main/LICENSE`;

function normalizeName(value) {
  return decodeURIComponent(value || "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getRecordKeys(record) {
  const urlName = record.source.downloadUrl ? basename(record.source.downloadUrl) : "";
  return [
    normalizeName(record.source.downloadUrl || ""),
    normalizeName(urlName),
    normalizeName(record.source.assetFileName),
  ].filter(Boolean);
}

function getCardKeys(card) {
  return [
    normalizeName(card.asset_url || ""),
    normalizeName(card.asset_filename || ""),
    normalizeName(card.title || ""),
  ].filter(Boolean);
}

function getOfficialPdfUrl(record) {
  return record.source.downloadUrl && !record.source.downloadUrl.endsWith("/N/A")
    ? record.source.downloadUrl
    : "";
}

function getOcrQuality(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return "none";
  }

  const confidenceMatches = [...trimmed.matchAll(/\[\[page\s+\d+\s+confidence:\s+([0-9.]+)\]\]/gi)];
  const confidenceValues = confidenceMatches.map((match) => Number.parseFloat(match[1])).filter(Number.isFinite);

  if (confidenceValues.length) {
    const average = confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length;

    if (average >= 85) {
      return "high";
    }

    if (average >= 60) {
      return "medium";
    }

    return "low";
  }

  if (trimmed.length > 1400) {
    return "high";
  }

  return "medium";
}

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function readJsonl(path) {
  const body = await readFile(path, "utf8");
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function findPagesPath(cardId) {
  const primary = preferPreCleanup ? "altered-ocr-pre" : "altered-ocr";
  const fallback = preferPreCleanup ? "altered-ocr" : "altered-ocr-pre";
  const primaryPath = resolve(sourceRoot, `data/${primary}/${cardId}/pages.jsonl`);
  const fallbackPath = resolve(sourceRoot, `data/${fallback}/${cardId}/pages.jsonl`);

  if (existsSync(primaryPath)) {
    return { path: primaryPath, dataPath: `data/${primary}/${cardId}/pages.jsonl` };
  }

  if (existsSync(fallbackPath)) {
    return { path: fallbackPath, dataPath: `data/${fallback}/${cardId}/pages.jsonl` };
  }

  return null;
}

function pageText(pages) {
  return pages
    .sort((a, b) => (a.page || 0) - (b.page || 0))
    .map((page) => {
      const confidence = typeof page.confidence === "number" ? ` [[page ${page.page} confidence: ${page.confidence}]]` : "";
      return `\f[Page ${page.page}]${confidence}\n${page.text || ""}`.trim();
    })
    .join("\n\n");
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const recordByKey = new Map();
const fetchedAt = new Date().toISOString();

for (const record of index.records) {
  for (const key of getRecordKeys(record)) {
    if (!recordByKey.has(key)) {
      recordByKey.set(key, record);
    }
  }
}

const report = {
  sourceRepo,
  sourceRepoUrl,
  sourceRoot,
  manifestPath,
  fetchedAt,
  cardsWithPageFiles: 0,
  matched: 0,
  imported: 0,
  skippedExistingLonger: 0,
  unmatched: [],
  missingPages: [],
  importedRecordIds: [],
};

await mkdir(documentsDir, { recursive: true });
await mkdir(ocrDir, { recursive: true });
await mkdir(reportsDir, { recursive: true });

for (const card of manifest.cards) {
  const pagesPath = findPagesPath(card.card_id);

  if (!pagesPath) {
    report.missingPages.push({ cardId: card.card_id, title: card.title, assetType: card.asset_type });
    continue;
  }

  report.cardsWithPageFiles += 1;

  const record = getCardKeys(card)
    .map((key) => recordByKey.get(key))
    .find(Boolean);

  if (!record) {
    report.unmatched.push({
      cardId: card.card_id,
      title: card.title,
      assetFilename: card.asset_filename,
      assetUrl: card.asset_url,
    });
    continue;
  }

  report.matched += 1;

  const documentId = record.documentId || record.source.id;
  const pages = await readJsonl(pagesPath.path);
  const ocrTextEn = pageText(pages);
  const existingOcr = await readJsonIfExists(resolve(ocrDir, `${documentId}.json`));

  if ((existingOcr?.ocrTextEn || "").length > ocrTextEn.length) {
    report.skippedExistingLonger += 1;
    continue;
  }

  const officialPdfUrl = getOfficialPdfUrl(record);
  const existingDocument = await readJsonIfExists(resolve(documentsDir, `${documentId}.json`));
  const existingStatus = existingDocument?.documentStatus || {};
  const document = {
    documentId,
    recordId: record.source.id,
    assetFileName: record.source.assetFileName,
    release: record.source.release,
    agency: record.source.agency,
    officialPdfUrl,
    sourcePdfUrl: officialPdfUrl,
    documentStatus: {
      ocr: ocrTextEn.trim() ? "ocr_imported_unverified" : "missing",
      translationJa: existingStatus.translationJa || "missing",
      summary: existingStatus.summary || "missing",
      humanReview: existingStatus.humanReview || "unreviewed",
    },
  };
  const ocr = {
    documentId,
    recordId: record.source.id,
    officialPdfUrl,
    sourcePdfUrl: officialPdfUrl,
    ocrTextEn,
    ocrQuality: getOcrQuality(ocrTextEn),
    source: {
      repo: sourceRepo,
      repoUrl: sourceRepoUrl,
      filePath: pagesPath.dataPath,
      githubUrl: `${sourceRepoUrl}/blob/main/${pagesPath.dataPath}`,
      rawUrl: `https://raw.githubusercontent.com/${sourceRepo}/main/${pagesPath.dataPath}`,
      fetchedAt,
      license: sourceLicense,
      licenseUrl: sourceLicenseUrl,
      cardId: card.card_id,
      pageCount: pages.length,
      sourceAssetUrl: card.asset_url || "",
    },
    status: {
      ocr: ocrTextEn.trim() ? "ocr_imported_unverified" : "missing",
      humanReview: "unreviewed",
    },
  };

  await writeFile(resolve(documentsDir, `${documentId}.json`), `${JSON.stringify(document, null, 2)}\n`, "utf8");
  await writeFile(resolve(ocrDir, `${documentId}.json`), `${JSON.stringify(ocr, null, 2)}\n`, "utf8");
  report.imported += 1;
  report.importedRecordIds.push(record.source.id);
}

await writeFile(
  resolve(reportsDir, "bpsai-pursue-ocr-import-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

console.log(`BPSAI OCR page files: ${report.cardsWithPageFiles}`);
console.log(`Matched Ruppelt records: ${report.matched}`);
console.log(`Imported/replaced OCR: ${report.imported}`);
console.log(`Skipped because existing OCR was longer: ${report.skippedExistingLonger}`);
console.log(`Unmatched page files: ${report.unmatched.length}`);
