import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const documentsDir = resolve(rootDir, "data/shared/pursue-documents");
const ocrDir = resolve(rootDir, "data/shared/ocr");
const reportsDir = resolve(rootDir, "data/shared/import-reports");
const sourceRepo = "zexiro/uap-disclosure-archive";
const sourceRepoUrl = `https://github.com/${sourceRepo}`;
const sourceListUrl = `https://api.github.com/repos/${sourceRepo}/contents/raw/text?ref=main`;
const args = process.argv.slice(2);
const sampleOnly = args.includes("--sample");
const limitArgIndex = args.indexOf("--limit");
const limit =
  limitArgIndex >= 0 && args[limitArgIndex + 1] ? Number.parseInt(args[limitArgIndex + 1], 10) : 0;
const sampleRecordIds = new Set([
  "pursue-0020",
  "pursue-0140",
  "pursue-0155",
  "pursue-0156",
  "pursue-0157",
]);

function normalizeName(value) {
  return decodeURIComponent(value)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getSourceKey(record) {
  const urlName = record.source.downloadUrl ? basename(record.source.downloadUrl) : "";
  return normalizeName(urlName || record.source.assetFileName);
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

  const letters = trimmed.match(/[A-Za-z]/g)?.length || 0;
  const ratio = letters / Math.max(trimmed.length, 1);

  if (ratio > 0.55 && trimmed.length > 1400) {
    return "high";
  }

  if (ratio > 0.35) {
    return "medium";
  }

  return "low";
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ufo-lab-ruppelt-ocr-import",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ufo-lab-ruppelt-ocr-import",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const sourceFiles = await fetchJson(sourceListUrl);
const sourceByKey = new Map(
  sourceFiles
    .filter((item) => item.type === "file" && item.name.endsWith(".txt"))
    .map((item) => [normalizeName(item.name), item]),
);
const candidateRecords = index.records.filter((record) => {
  if (sampleOnly) {
    return sampleRecordIds.has(record.source.id);
  }

  return Boolean(getSourceKey(record));
});
const records = limit > 0 ? candidateRecords.slice(0, limit) : candidateRecords;
const fetchedAt = new Date().toISOString();
const unmatched = [];
const importedRecordIds = [];
let imported = 0;
let emptyOcr = 0;
let documentOnly = 0;

await mkdir(documentsDir, { recursive: true });
await mkdir(ocrDir, { recursive: true });
await mkdir(reportsDir, { recursive: true });

async function writeSharedDocument(record, documentId, officialPdfUrl, ocrStatus) {
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
      ocr: ocrStatus,
      translationJa: existingStatus.translationJa || "missing",
      summary: existingStatus.summary || "missing",
      humanReview: existingStatus.humanReview || "unreviewed",
    },
  };

  await writeFile(resolve(documentsDir, `${documentId}.json`), `${JSON.stringify(document, null, 2)}\n`, "utf8");
}

for (const record of records) {
  const documentId = record.documentId || record.source.id;
  const sourceKey = getSourceKey(record);
  const sourceFile = sourceByKey.get(sourceKey);
  const officialPdfUrl = getOfficialPdfUrl(record);

  if (!sourceFile?.download_url) {
    unmatched.push({ recordId: record.source.id, assetFileName: record.source.assetFileName, sourceKey });
    await writeSharedDocument(record, documentId, officialPdfUrl, "missing");
    documentOnly += 1;
    continue;
  }

  const ocrTextEn = await fetchText(sourceFile.download_url);
  const hasOcrText = Boolean(ocrTextEn.trim());
  const ocrStatus = hasOcrText ? "ocr_imported_unverified" : "missing";
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
      filePath: sourceFile.path,
      githubUrl: sourceFile.html_url,
      rawUrl: sourceFile.download_url,
      fetchedAt,
      license: "MIT licensed source; U.S. government source material described as public domain by source repository",
      licenseUrl: `${sourceRepoUrl}/blob/main/LICENSE`,
    },
    status: {
      ocr: ocrStatus,
      humanReview: "unreviewed",
    },
  };

  await writeSharedDocument(record, documentId, officialPdfUrl, ocrStatus);
  await writeFile(resolve(ocrDir, `${documentId}.json`), `${JSON.stringify(ocr, null, 2)}\n`, "utf8");
  if (!hasOcrText) {
    emptyOcr += 1;
  }
  imported += 1;
  importedRecordIds.push(record.source.id);
}

const report = {
  sourceRepo,
  sourceRepoUrl,
  sourceListUrl,
  mode: sampleOnly ? "sample" : "all",
  fetchedAt,
  attempted: records.length,
  imported,
  emptyOcr,
  documentOnly,
  unmatched,
  importedRecordIds,
};

await writeFile(
  resolve(reportsDir, "pursue-ocr-import-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

console.log(`Imported OCR for ${imported} record(s).`);
console.log(`Empty OCR text: ${emptyOcr} record(s).`);
console.log(`Created document-only entries for ${documentOnly} record(s).`);

if (unmatched.length) {
  console.log("Unmatched records:");
  for (const item of unmatched) {
    console.log(`- ${item.recordId}: ${item.assetFileName} (${item.sourceKey})`);
  }
}
