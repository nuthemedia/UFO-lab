import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");
const auditPath = resolve(rootDir, "data/pursue/release04-prior-disclosure-audit.json");
const checkedAt = "2026-07-11";

const statusLabels = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  unknown: "判定不能",
};

const archiveUrls = {
  warGov: "https://www.war.gov/UFO/release/04/",
  cia: "https://www.cia.gov/readingroom/search/site/",
  fbi: "https://vault.fbi.gov/search?SearchableText=",
  nasa: "https://www.nasa.gov/history/",
  dvids: "https://www.dvidshub.net/search/?q=",
  archive: "https://archive.org/search?query=",
};

const existingAuditSources = [
  {
    source: "they_are_here",
    label: "they-are-here.com",
    result: "no_release_04_classification_dataset_found",
    noteJa: "Release 04の個別監査ページまたは分類表は確認できませんでした。",
  },
  {
    source: "abigailhaddad_ufo_releases",
    label: "abigailhaddad/ufo-releases",
    url: "https://github.com/abigailhaddad/ufo-releases",
    result: "metadata_and_ocr_only",
    noteJa: "Release 04のメタデータと一部OCRはありますが、既出・初出分類は含まれていません。",
  },
  {
    source: "public_archive_search",
    label: "NASA / CIA / FBI / DVIDS / Internet Archive",
    result: "used_for_record_level_provisional_review",
    noteJa: "公的アーカイブと補助アーカイブを個別資料の照合候補として利用しました。",
  },
];

function encode(value) {
  return encodeURIComponent(String(value || "").replace(/\s+/g, " ").trim());
}

function officialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || archiveUrls.warGov;
}

function evidence(type, label, url, noteJa, confidence) {
  return {
    type,
    label,
    url,
    noteJa,
    matchedFields: ["assetFileName", "agency", "documentType"],
    confidence,
  };
}

function attribution(source, sourceUrl, role = "official_archive") {
  return { source, sourceUrl, role, visible: "secondary" };
}

function disclosure(record, config) {
  return {
    status: config.status,
    labelJa: statusLabels[config.status],
    confidence: config.confidence,
    evidenceSummaryJa: config.summary,
    evidence: [
      evidence(
        "official_source",
        "PURSUE official",
        officialUrl(record),
        "PURSUE Release 04の公式掲載資料として確認しました。",
        "high",
      ),
      evidence(config.evidenceType, config.label, config.url, config.noteJa, config.confidence),
    ],
    attribution: [
      attribution(config.source, config.url, config.role),
      attribution("ruppelt", "https://ufolab.tokyo/ruppelt", "ruppelt_review"),
    ],
    checkedAt,
    checkedBy: "ruppelt",
    ruppeltVerified: false,
    manualReviewRequired: true,
    reviewerNoteJa:
      "Release 04向けの既存分類済み監査表は確認できなかったため、Ruppelt暫定照合として分類しました。",
    _audit: { method: config.method, existingClassificationDataset: "not_found" },
  };
}

function historical(record) {
  const title = record.source.assetFileName;
  const isCia = record.source.agency === "CIA";
  const isFbi = record.source.agency === "FBI";
  const url = isCia
    ? `${archiveUrls.cia}${encode(title)}`
    : isFbi
      ? `${archiveUrls.fbi}${encode(title)}`
      : `${archiveUrls.archive}${encode(title)}`;
  const source = isCia ? "cia_crest" : isFbi ? "fbi_vault" : "internet_archive";

  return disclosure(record, {
    status: "previously_public",
    confidence: "medium",
    method: "historical_archive_or_catalog_match",
    summary: [
      "同名または同等の歴史資料が公的・補助アーカイブで既公開の資料群として照合できます。",
      "PURSUE版ではUAP文脈の資料として再掲されています。",
    ],
    evidenceType: "archive_match",
    label: isCia ? "CIA Reading Room search" : isFbi ? "FBI Vault search" : "Public archive search",
    url,
    noteJa: "文書名と資料群を用いた既公開アーカイブ照合候補です。",
    source,
  });
}

function partial(record, family) {
  const title = record.source.assetFileName;
  const isNasa = record.source.agency === "NASA";
  const url = isNasa ? archiveUrls.nasa : `${archiveUrls.archive}${encode(title)}`;

  return disclosure(record, {
    status: "partial",
    confidence: "medium",
    method: "source_material_public_pursue_package_not_fully_matched",
    summary: [
      `${family}の元記録・関連資料は既公開ですが、PURSUE版ファイル全体の同一公開までは確認していません。`,
      "PURSUE版には抜粋、編集、静止画化またはUAP文脈での再掲が含まれます。",
    ],
    evidenceType: isNasa ? "catalog_match" : "archive_match",
    label: isNasa ? "NASA History / mission archive" : "Public archive search",
    url,
    noteJa: "元ミッション記録または関連する歴史資料の既公開照合候補です。",
    source: isNasa ? "nasa" : "internet_archive",
  });
}

function recent(record) {
  const title = record.source.assetFileName;
  const media = ["VID", "AUD"].includes(record.source.documentType);
  const url = media ? `${archiveUrls.dvids}${encode(title)}` : `${archiveUrls.archive}${encode(title)}`;

  return disclosure(record, {
    status: "first_time_public",
    confidence: "low",
    method: "no_prior_same_file_publication_found",
    summary: [
      "既存の分類済み監査データやPURSUE以前の同一ファイル公開は確認できませんでした。",
      "初公開の断定を避けるため、信頼度は低としています。",
    ],
    evidenceType: record.source.documentType === "VID" ? "video_match" : "metadata_match",
    label: media ? "DVIDS / archive search" : "Archive search",
    url,
    noteJa: "同一資料の過去公開確認に使った検索候補で、明確な先行公開一致は確認できませんでした。",
    source: media ? "dvids" : "ruppelt",
    role: media ? "auxiliary_archive" : "ruppelt_review",
  });
}

const historicalIds = new Set([
  "pursue-0295",
  "pursue-0296",
  "pursue-0297",
  "pursue-0305",
  "pursue-0306",
  "pursue-0311",
  "pursue-0312",
  "pursue-0330",
]);
const partialIds = new Map([
  ["pursue-0302", "STS-80ミッション画像"],
  ["pursue-0303", "STS-80ミッション画像"],
  ["pursue-0304", "STS-80ミッション画像"],
  ["pursue-0313", "米加航空計画・UFO目撃資料"],
  ["pursue-0314", "Project Blue Book関連通信"],
  ["pursue-0331", "Apollo 14ミッション・デブリーフィング"],
  ["pursue-0332", "Apollo 14ミッション・デブリーフィング"],
  ["pursue-0333", "Apollo 17ミッション・デブリーフィング"],
  ["pursue-0334", "Apollo 17ミッション・デブリーフィング"],
]);

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const existing = JSON.parse(await readFile(priorDisclosuresPath, "utf8").catch(() => "{}"));
const release04Records = index.records.filter(
  (record) => record.searchFacets?.releaseId === "release_04",
);
const generated = {};
const auditRecords = [];

for (const record of release04Records) {
  const item = historicalIds.has(record.source.id)
    ? historical(record)
    : partialIds.has(record.source.id)
      ? partial(record, partialIds.get(record.source.id))
      : recent(record);

  generated[record.source.id] = item;
  auditRecords.push({
    recordId: record.source.id,
    title: record.source.assetFileName,
    officialUrl: officialUrl(record),
    status: item.status,
    confidence: item.confidence,
    method: item._audit.method,
    existingClassificationDataset: item._audit.existingClassificationDataset,
    evidenceLabels: item.evidence.map((entry) => entry.label),
    attributionSources: item.attribution.map((entry) => entry.source),
  });
  delete item._audit;
}

if (release04Records.length !== 40 || Object.keys(generated).length !== 40) {
  throw new Error(`Expected 40 Release 04 classifications, found ${Object.keys(generated).length}.`);
}

const statusCounts = Object.values(generated).reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});
const audit = {
  generatedAt: checkedAt,
  release: "7/10/26",
  releaseId: "release_04",
  recordCount: 40,
  existingAuditSources,
  summary: {
    existingClassificationDatasetFound: 0,
    ruppeltTemporaryReviewCount: 40,
    statusCounts,
  },
  policy: {
    sourceOfTruth: "PURSUE / war.gov official metadata and official file links",
    release04Result:
      "No Release 04 classification dataset equivalent to the Release 01 external audit was found. All classifications are provisional and require manual review.",
  },
  records: auditRecords,
};

await writeFile(priorDisclosuresPath, `${JSON.stringify({ ...existing, ...generated }, null, 2)}\n`);
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

console.log(JSON.stringify({ release04Count: release04Records.length, statusCounts }, null, 2));
