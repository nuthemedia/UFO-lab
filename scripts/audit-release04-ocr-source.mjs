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

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ufo-lab-ruppelt-release04-audit" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function officialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || "";
}

const localIndex = JSON.parse(await readFile(recordsPath, "utf8"));
const githubRecords = await fetchJson(githubRecordsUrl);
const release04Records = localIndex.records.filter(
  (record) => record.searchFacets?.releaseId === "release_04",
);
const githubByTitle = new Map(githubRecords.map((record) => [normalizeKey(record.title), record]));
const githubByUrl = new Map(
  githubRecords
    .filter((record) => record.fileUrl)
    .map((record) => [normalizeKey(record.fileUrl), record]),
);

const rows = release04Records.map((record) => {
  const titleMatch = githubByTitle.get(normalizeKey(record.source.assetFileName));
  const urlMatch = githubByUrl.get(normalizeKey(officialUrl(record)));
  const matched = titleMatch || urlMatch || null;
  const hasText = Boolean(matched?.textChars && Number(matched.textChars) > 0);

  return {
    recordId: record.source.id,
    title: record.source.assetFileName,
    agency: record.source.agency,
    type: record.source.documentType,
    officialUrl: officialUrl(record),
    githubId: matched?.id || null,
    githubTitle: matched?.title || null,
    githubTextUrl: hasText ? `${githubTextBaseUrl}/${matched.id}.txt` : "",
    textChars: Number(matched?.textChars || 0),
    hasText,
    matchedBy: titleMatch ? "title" : urlMatch ? "official_url" : "none",
  };
});

const unmapped = rows.filter((row) => !row.githubId);
const withText = rows.filter((row) => row.hasText);
const withoutText = rows.filter((row) => row.githubId && !row.hasText);
const result = {
  generatedAt: new Date().toISOString(),
  source: {
    repo: "abigailhaddad/ufo-releases",
    recordsUrl: githubRecordsUrl,
    textBaseUrl: githubTextBaseUrl,
    license: "not_declared",
  },
  releaseId: "release_04",
  localCount: release04Records.length,
  githubRecordCount: githubRecords.length,
  mappedCount: rows.length - unmapped.length,
  withTextCount: withText.length,
  withoutTextCount: withoutText.length,
  unmappedCount: unmapped.length,
  rows,
};

console.log(JSON.stringify(result, null, 2));

if (release04Records.length !== 40 || unmapped.length > 0) {
  process.exit(1);
}

if (withText.length !== 12 || withoutText.length !== 28) {
  console.error(`Expected 12 OCR-backed and 28 text-missing records, found ${withText.length}/${withoutText.length}.`);
  process.exit(1);
}
