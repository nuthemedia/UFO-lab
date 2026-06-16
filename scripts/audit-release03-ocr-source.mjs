import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const recordsPath = resolve(process.cwd(), "data/pursue/pursue-records.json");
const githubRecordsUrl = "https://raw.githubusercontent.com/abigailhaddad/ufo-releases/main/data/records.json";
const githubTextBaseUrl = "https://raw.githubusercontent.com/abigailhaddad/ufo-releases/main/data/text";

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s_\-–—“”\"'.,()]+/g, "")
    .replace(/&/g, "and");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ufo-lab-ruppelt-release03-audit" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch " + url + ": " + response.status + " " + response.statusText);
  }

  return response.json();
}

function getOfficialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || "";
}

const localIndex = await readJson(recordsPath);
const githubRecords = await fetchJson(githubRecordsUrl);
const release03Records = localIndex.records.filter((record) => record.source.release === "6/12/26");
const githubByTitle = new Map(githubRecords.map((record) => [normalizeKey(record.title), record]));
const githubByUrl = new Map(
  githubRecords
    .filter((record) => record.fileUrl)
    .map((record) => [normalizeKey(record.fileUrl), record]),
);

const rows = release03Records.map((record) => {
  const titleMatch = githubByTitle.get(normalizeKey(record.source.assetFileName));
  const urlMatch = githubByUrl.get(normalizeKey(getOfficialUrl(record)));
  const matched = titleMatch || urlMatch || null;
  const hasText = Boolean(matched?.textChars && Number(matched.textChars) > 0);

  return {
    recordId: record.source.id,
    title: record.source.assetFileName,
    agency: record.source.agency,
    type: record.source.documentType,
    officialUrl: getOfficialUrl(record),
    githubId: matched?.id || null,
    githubTitle: matched?.title || null,
    githubTextUrl: hasText ? githubTextBaseUrl + "/" + matched.id + ".txt" : "",
    textChars: matched?.textChars || 0,
    hasText,
    matchedBy: titleMatch ? "title" : urlMatch ? "official_url" : "none",
  };
});

const unmapped = rows.filter((row) => !row.githubId);
const withText = rows.filter((row) => row.hasText);
const withoutText = rows.filter((row) => row.githubId && !row.hasText);

const result = {
  source: {
    repo: "abigailhaddad/ufo-releases",
    recordsUrl: githubRecordsUrl,
    textBaseUrl: githubTextBaseUrl,
    license: "not_declared",
  },
  localRelease03Count: release03Records.length,
  githubRecordCount: githubRecords.length,
  mappedCount: rows.length - unmapped.length,
  withTextCount: withText.length,
  withoutTextCount: withoutText.length,
  unmappedCount: unmapped.length,
  rows,
  withoutText: withoutText.map((row) => ({
    recordId: row.recordId,
    githubId: row.githubId,
    type: row.type,
    agency: row.agency,
    title: row.title,
  })),
  unmapped,
};

console.log(JSON.stringify(result, null, 2));

if (release03Records.length !== 72) {
  console.error("Expected 72 local Release 03 records, found " + release03Records.length + ".");
  process.exit(1);
}

if (unmapped.length > 0) {
  console.error("Could not map " + unmapped.length + " Release 03 record(s).");
  process.exit(1);
}

if (withText.length !== 52 || withoutText.length !== 20) {
  console.error("Expected 52 OCR-backed and 20 OCR-missing Release 03 records, found " + withText.length + "/" + withoutText.length + ".");
  process.exit(1);
}
