import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const recordsPath = resolve(process.cwd(), "data/pursue/pursue-records.json");
const githubRecordsUrl = "https://raw.githubusercontent.com/abigailhaddad/ufo-releases/main/data/records.json";
const githubTextBaseUrl = "https://raw.githubusercontent.com/abigailhaddad/ufo-releases/main/data/text";
const limitArgIndex = process.argv.indexOf("--limit");
const limit = limitArgIndex >= 0 && process.argv[limitArgIndex + 1]
  ? Number.parseInt(process.argv[limitArgIndex + 1], 10)
  : 0;

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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ufo-lab-ruppelt-release03-disclosure-audit" },
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

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function pickPhrases(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const quoted = Array.from(normalized.matchAll(/[“\"]([^”\"]{12,90})[”\"]/g)).map((match) => match[1]);
  const identifiers = Array.from(
    normalized.matchAll(/\b(?:FD-\d{3,5}|FD-\d{3,5}-\d+|\d{2,3}-HQ-\d+|NASA-UAP-D\d+|FBI-UAP-D\d+|CIA-UAP-\d+|DOW-UAP-D\d+|USG-UAP-D\d+)\b/gi),
  ).map((match) => match[0]);
  const titleLike = Array.from(
    normalized.matchAll(/\b(?:Gemini|Apollo|Mercury|Roswell|Colorado Springs|Northeastern Orb|Western United States|Flying Saucer|UFO|UAP)[^.!?]{0,80}/gi),
  ).map((match) => match[0].trim());

  return unique([...identifiers, ...quoted, ...titleLike])
    .map((phrase) => phrase.replace(/\s+/g, " ").trim())
    .filter((phrase) => phrase.length >= 4)
    .slice(0, 8);
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
const candidates = [];

for (const record of release03Records) {
  const githubRecord =
    githubByTitle.get(normalizeKey(record.source.assetFileName)) ||
    githubByUrl.get(normalizeKey(getOfficialUrl(record)));

  if (!githubRecord?.textChars) {
    candidates.push({
      recordId: record.source.id,
      title: record.source.assetFileName,
      status: "no_ocr_text",
      suggestedQueries: [record.source.assetFileName, record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl].filter(Boolean),
    });
    continue;
  }

  if (limit > 0 && candidates.filter((item) => item.status === "candidate_queries").length >= limit) {
    continue;
  }

  const rawUrl = githubTextBaseUrl + "/" + githubRecord.id + ".txt";
  const ocrText = await fetchText(rawUrl);
  const phrases = pickPhrases(ocrText);
  candidates.push({
    recordId: record.source.id,
    githubId: githubRecord.id,
    title: record.source.assetFileName,
    status: "candidate_queries",
    sourceTextUrl: rawUrl,
    suggestedQueries: unique([
      record.source.assetFileName,
      record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl,
      ...phrases,
    ]).slice(0, 10),
    preferredSources: ["NASA History", "FBI Vault", "CIA Reading Room", "NARA", "DVIDS", "AARO", "Internet Archive"],
  });
}

console.log(JSON.stringify({
  note: "This script does not write OCR text. It prints candidate search queries for manual prior-disclosure review.",
  release03Count: release03Records.length,
  candidateCount: candidates.filter((item) => item.status === "candidate_queries").length,
  noOcrTextCount: candidates.filter((item) => item.status === "no_ocr_text").length,
  candidates,
}, null, 2));
