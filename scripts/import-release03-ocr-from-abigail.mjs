import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const recordsPath = resolve(process.cwd(), "data/pursue/pursue-records.json");
const bundlesPath = resolve(process.cwd(), "data/shared/pursue-document-bundles.json");
const documentsDir = resolve(process.cwd(), "data/shared/pursue-documents");
const githubRecordsUrl = "https://raw.githubusercontent.com/abigailhaddad/ufo-releases/main/data/records.json";
const githubTextBaseUrl = "https://raw.githubusercontent.com/abigailhaddad/ufo-releases/main/data/text";
const allowUnverifiedLicense = process.argv.includes("--accept-unverified-license");
const dryRun = process.argv.includes("--dry-run");

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s_\-–—“”\"'.,()]+/g, "")
    .replace(/&/g, "and");
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ufo-lab-ruppelt-release03-import" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch " + url + ": " + response.status + " " + response.statusText);
  }

  return response.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function getOfficialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || "";
}

function getOcrQuality(text) {
  const length = text.trim().length;

  if (length < 80) {
    return "low";
  }

  return "medium";
}

if (!allowUnverifiedLicense && !dryRun) {
  console.error(
    "abigailhaddad/ufo-releases has no declared GitHub license. Rerun with --dry-run for audit only, or --accept-unverified-license after confirming this OCR can be stored.",
  );
  process.exit(1);
}

const localIndex = await readJson(recordsPath, { records: [] });
const bundles = await readJson(bundlesPath, {});
const githubRecords = await fetchJson(githubRecordsUrl);
const release03Records = localIndex.records.filter((record) => record.source.release === "6/12/26");
const githubByTitle = new Map(githubRecords.map((record) => [normalizeKey(record.title), record]));
const githubByUrl = new Map(
  githubRecords
    .filter((record) => record.fileUrl)
    .map((record) => [normalizeKey(record.fileUrl), record]),
);
const now = new Date().toISOString();
const imported = [];
const skipped = [];

await mkdir(documentsDir, { recursive: true });

for (const record of release03Records) {
  const githubRecord =
    githubByTitle.get(normalizeKey(record.source.assetFileName)) ||
    githubByUrl.get(normalizeKey(getOfficialUrl(record)));

  if (!githubRecord) {
    skipped.push({ recordId: record.source.id, reason: "no_github_record", title: record.source.assetFileName });
    continue;
  }

  if (!githubRecord.textChars || Number(githubRecord.textChars) <= 0) {
    skipped.push({
      recordId: record.source.id,
      githubId: githubRecord.id,
      reason: "no_text_chars",
      title: record.source.assetFileName,
    });
    continue;
  }

  const rawUrl = githubTextBaseUrl + "/" + githubRecord.id + ".txt";
  const ocrTextEn = await fetchText(rawUrl);
  const officialUrl = getOfficialUrl(record);
  const existingBundle = bundles[record.source.id] || {};
  const document = {
    ...(existingBundle.document || {}),
    documentId: record.source.id,
    recordId: record.source.id,
    assetFileName: record.source.assetFileName,
    release: record.source.release,
    agency: record.source.agency,
    officialPdfUrl: record.source.downloadUrl || officialUrl,
    sourcePdfUrl: record.source.downloadUrl || officialUrl,
    documentStatus: {
      ocr: "ocr_imported_unverified",
      translationJa: existingBundle.document?.documentStatus?.translationJa || "missing",
      summary: existingBundle.document?.documentStatus?.summary || "missing",
      humanReview: existingBundle.document?.documentStatus?.humanReview || "unreviewed",
    },
  };

  const bundle = {
    ...existingBundle,
    document,
    ocr: {
      documentId: record.source.id,
      recordId: record.source.id,
      officialPdfUrl: record.source.downloadUrl || officialUrl,
      sourcePdfUrl: record.source.downloadUrl || officialUrl,
      ocrTextEn,
      ocrQuality: getOcrQuality(ocrTextEn),
      source: {
        repo: "abigailhaddad/ufo-releases",
        repoUrl: "https://github.com/abigailhaddad/ufo-releases",
        filePath: "data/text/" + githubRecord.id + ".txt",
        githubUrl: "https://github.com/abigailhaddad/ufo-releases/blob/main/data/text/" + githubRecord.id + ".txt",
        rawUrl,
        fetchedAt: now,
        license: "Repository license is not declared; OCR imported only after explicit local acceptance as an AI transcription of public U.S. government source material.",
        licenseUrl: "",
        licenseStatus: "unverified",
        upstreamRecordId: String(githubRecord.id),
        upstreamRecordUrl: "https://github.com/abigailhaddad/ufo-releases/blob/main/data/records.json",
        sourceAssetUrl: officialUrl,
      },
      status: {
        ocr: "ocr_imported_unverified",
        humanReview: "unreviewed",
      },
    },
  };

  bundles[record.source.id] = bundle;
  imported.push({
    recordId: record.source.id,
    githubId: githubRecord.id,
    textChars: ocrTextEn.length,
    title: record.source.assetFileName,
  });

  if (!dryRun) {
    await writeFile(resolve(documentsDir, record.source.id + ".json"), JSON.stringify(document, null, 2) + "\n", "utf8");
  }
}

if (!dryRun) {
  await writeFile(bundlesPath, JSON.stringify(bundles, null, 2) + "\n", "utf8");
}

console.log(JSON.stringify({ dryRun, importedCount: imported.length, skippedCount: skipped.length, imported, skipped }, null, 2));

if (imported.length !== 52 || skipped.length !== 20) {
  console.error("Expected 52 imported and 20 skipped records, found " + imported.length + "/" + skipped.length + ".");
  process.exit(1);
}
