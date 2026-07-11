import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const recordsPath = resolve(process.cwd(), "data/pursue/pursue-records.json");
const bundlesPath = resolve(process.cwd(), "data/shared/pursue-document-bundles.json");
const documentsDir = resolve(process.cwd(), "data/shared/pursue-documents");
const auditPath = resolve(process.cwd(), "data/pursue/release04-ocr-audit.json");
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ufo-lab-ruppelt-release04-import" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function officialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || "";
}

if (!allowUnverifiedLicense && !dryRun) {
  throw new Error("Use --dry-run or confirm the accepted unverified license with --accept-unverified-license.");
}

const localIndex = JSON.parse(await readFile(recordsPath, "utf8"));
const bundles = JSON.parse(await readFile(bundlesPath, "utf8").catch(() => "{}"));
const githubRecords = JSON.parse(await fetchText(githubRecordsUrl));
const release04Records = localIndex.records.filter(
  (record) => record.searchFacets?.releaseId === "release_04",
);
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

for (const record of release04Records) {
  const githubRecord =
    githubByTitle.get(normalizeKey(record.source.assetFileName)) ||
    githubByUrl.get(normalizeKey(officialUrl(record)));

  if (!githubRecord) {
    skipped.push({ recordId: record.source.id, reason: "no_github_record" });
    continue;
  }

  if (!githubRecord.textChars || Number(githubRecord.textChars) <= 0) {
    skipped.push({
      recordId: record.source.id,
      githubId: githubRecord.id,
      type: record.source.documentType,
      reason: "no_upstream_text",
      ...(record.source.documentType === "PDF"
        ? { fallbackOcrStatus: "official_cli_download_blocked_403_browser_download_required" }
        : {}),
      ...(record.source.documentType === "AUD"
        ? { transcriptStatus: "no_trustworthy_existing_transcript_found" }
        : {}),
      title: record.source.assetFileName,
    });
    continue;
  }

  const rawUrl = `${githubTextBaseUrl}/${githubRecord.id}.txt`;
  const ocrTextEn = await fetchText(rawUrl);
  const sourceUrl = officialUrl(record);
  const existingBundle = bundles[record.source.id] || {};
  const document = {
    ...(existingBundle.document || {}),
    documentId: record.source.id,
    recordId: record.source.id,
    assetFileName: record.source.assetFileName,
    release: record.source.release,
    agency: record.source.agency,
    officialPdfUrl: record.source.downloadUrl || sourceUrl,
    sourcePdfUrl: record.source.downloadUrl || sourceUrl,
    documentStatus: {
      ocr: "ocr_imported_unverified",
      translationJa: existingBundle.document?.documentStatus?.translationJa || "missing",
      summary: existingBundle.document?.documentStatus?.summary || "missing",
      humanReview: existingBundle.document?.documentStatus?.humanReview || "unreviewed",
    },
  };

  bundles[record.source.id] = {
    ...existingBundle,
    document,
    ocr: {
      documentId: record.source.id,
      recordId: record.source.id,
      officialPdfUrl: record.source.downloadUrl || sourceUrl,
      sourcePdfUrl: record.source.downloadUrl || sourceUrl,
      ocrTextEn,
      ocrQuality: ocrTextEn.trim().length < 80 ? "low" : "medium",
      source: {
        repo: "abigailhaddad/ufo-releases",
        repoUrl: "https://github.com/abigailhaddad/ufo-releases",
        filePath: `data/text/${githubRecord.id}.txt`,
        githubUrl: `https://github.com/abigailhaddad/ufo-releases/blob/main/data/text/${githubRecord.id}.txt`,
        rawUrl,
        fetchedAt: now,
        license: "Repository license is not declared; imported after explicit user acceptance as an OCR transcription of public U.S. government source material.",
        licenseUrl: "",
        licenseStatus: "unverified_accepted",
        upstreamRecordId: String(githubRecord.id),
        upstreamRecordUrl: "https://github.com/abigailhaddad/ufo-releases/blob/main/data/records.json",
        sourceAssetUrl: sourceUrl,
      },
      status: { ocr: "ocr_imported_unverified", humanReview: "unreviewed" },
    },
  };

  imported.push({
    recordId: record.source.id,
    githubId: githubRecord.id,
    textChars: ocrTextEn.length,
    title: record.source.assetFileName,
  });

  if (!dryRun) {
    await writeFile(resolve(documentsDir, `${record.source.id}.json`), `${JSON.stringify(document, null, 2)}\n`);
  }
}

const audit = {
  generatedAt: now,
  releaseId: "release_04",
  sourceRepo: "abigailhaddad/ufo-releases",
  licenseStatus: "unverified_accepted",
  importedCount: imported.length,
  skippedCount: skipped.length,
  imported,
  skipped,
};

if (!dryRun) {
  await writeFile(bundlesPath, `${JSON.stringify(bundles, null, 2)}\n`);
  await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
}

console.log(JSON.stringify({ dryRun, ...audit }, null, 2));

if (imported.length !== 12 || skipped.length !== 28) {
  process.exit(1);
}
