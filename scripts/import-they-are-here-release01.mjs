import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");
const sourceUrl = "https://they-are-here.com/";
const htmlPath = process.argv[2];

const sourceHtml = htmlPath ? await readFile(resolve(rootDir, htmlPath), "utf8") : await fetch(sourceUrl).then((res) => res.text());
const index = JSON.parse(await readFile(recordsPath, "utf8"));
const existingPriorDisclosures = JSON.parse(await readFile(priorDisclosuresPath, "utf8"));

const statusByTheyAreHereValue = {
  true: "previously_public",
  false: "first_time_public",
  partial: "partial",
  null: "unknown",
};

const labelByStatus = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  known_case_new_file: "事件は既知・資料は初公開",
  unknown: "判定不能",
};

const summaryByStatus = {
  first_time_public: "主要な既存公開資料との一致が確認されていないものとして照合されています。",
  previously_public: "過去公開資料との一致があるものとして照合されています。",
  partial: "事件、元資料、または元画像などの一部が過去公開済みのものとして照合されています。",
  known_case_new_file: "事件自体は既知だが、PURSUE版資料そのものは初公開相当として照合されています。",
  unknown: "公開状況を判定できないものとして照合されています。",
};

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value) {
  return decodeHtml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeKey(value) {
  return decodeHtml(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function getDowUapCode(value) {
  return decodeHtml(value).match(/\bDOW-UAP-[A-Z]?\d+(?=[^A-Z0-9]|$)/i)?.[0].toUpperCase() || "";
}

function parseRows(html) {
  return [...html.matchAll(/<tr data-agency="([^"]*)" data-type="([^"]*)" data-pd="([^"]*)" data-title="([^"]*)"[\s\S]*?<\/tr>/g)].map((match) => {
    const rowHtml = match[0];
    const href = rowHtml.match(/<a href="([^"]+)"/)?.[1] || "";
    const slug = decodeURIComponent(href.split("/").filter(Boolean).pop() || "");
    const slugRecordName = slug.split("--").pop() || slug;

    return {
      agency: decodeHtml(match[1]),
      type: decodeHtml(match[2]),
      sourceStatus: match[3],
      title: decodeHtml(match[4]),
      href,
      itemUrl: new URL(href, sourceUrl).href,
      slugRecordName: decodeHtml(slugRecordName),
      officialName: stripHtml(rowHtml.match(/<code>([\s\S]*?)<\/code>/)?.[1] || ""),
      noteJa: stripHtml(rowHtml.match(/<div class="notes">([\s\S]*?)<\/div>/)?.[1] || ""),
    };
  });
}

const release01Records = index.records.filter((record) => record.source.release === "5/8/26");
const rows = parseRows(sourceHtml);
const rowsByOfficialName = new Map(rows.filter((row) => row.officialName).map((row) => [normalizeKey(row.officialName), row]));
const rowsBySlugRecordName = new Map(rows.map((row) => [normalizeKey(row.slugRecordName), row]));
const rowsByDowUapCode = new Map(rows.filter((row) => getDowUapCode(row.slugRecordName)).map((row) => [getDowUapCode(row.slugRecordName), row]));

const nextPriorDisclosures = Object.fromEntries(
  Object.entries(existingPriorDisclosures).filter(([recordId]) => {
    const record = index.records.find((candidate) => candidate.source.id === recordId);
    return record?.source.release !== "5/8/26";
  }),
);

const unmatched = [];

for (const record of release01Records) {
  const recordName = record.source.assetFileName;
  const row =
    rowsByOfficialName.get(normalizeKey(recordName)) ||
    rowsBySlugRecordName.get(normalizeKey(recordName)) ||
    rowsByDowUapCode.get(getDowUapCode(recordName));

  if (!row) {
    unmatched.push(recordName);
    continue;
  }

  const status = statusByTheyAreHereValue[row.sourceStatus] || "unknown";

  nextPriorDisclosures[record.source.id] = {
    status,
    labelJa: labelByStatus[status],
    confidence: status === "unknown" ? "low" : "medium",
    evidenceSummaryJa: [summaryByStatus[status]],
    evidence: [
      {
        type: "manual_review",
        label: "Release 01 audit row",
        url: row.itemUrl,
        noteJa: summaryByStatus[status],
        matchedFields: ["assetFileName", "release", "agency", "documentType"],
        confidence: status === "unknown" ? "low" : "medium",
      },
    ],
    attribution: [
      {
        source: "they_are_here",
        sourceUrl: row.itemUrl,
        role: "external_audit_reference",
        visible: "secondary",
      },
    ],
    checkedBy: "external",
    ruppeltVerified: false,
    manualReviewRequired: status === "unknown",
    reviewerNoteJa: row.noteJa ? `Release 01外部照合メモ: ${row.noteJa.slice(0, 180)}` : undefined,
  };
}

if (unmatched.length > 0) {
  throw new Error(`Failed to match ${unmatched.length} Release 01 records:\n${unmatched.join("\n")}`);
}

await writeFile(priorDisclosuresPath, `${JSON.stringify(nextPriorDisclosures, null, 2)}\n`, "utf8");
console.log(`Imported ${release01Records.length} Release 01 prior-disclosure rows from ${htmlPath || sourceUrl}`);
