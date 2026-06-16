import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");
const auditPath = resolve(rootDir, "data/pursue/release03-prior-disclosure-audit.json");

const checkedAt = "2026-06-16";

const statusLabels = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  unknown: "判定不能",
};

const existingAuditSources = [
  {
    source: "they_are_here",
    label: "they-are-here.com",
    result: "no_release_03_classification_dataset_found",
    noteJa: "Release 01相当の個別監査ページやRelease 03分類表は確認できませんでした。",
  },
  {
    source: "abigailhaddad_ufo_releases",
    label: "abigailhaddad/ufo-releases",
    url: "https://github.com/abigailhaddad/ufo-releases",
    result: "metadata_and_ocr_only",
    noteJa: "Release 03のメタデータとOCR本文は確認できましたが、既出/初出分類は含まれていません。",
  },
  {
    source: "zexiro_uap_disclosure_archive",
    label: "zexiro/uap-disclosure-archive",
    url: "https://github.com/zexiro/uap-disclosure-archive",
    result: "archive_mirror_no_prior_disclosure_classification_found",
    noteJa: "PURSUE資料アーカイブとして参照しましたが、Release 03の既出/初出分類データは確認できませんでした。",
  },
  {
    source: "alexzhangji_ufo_pursue_open_atlas",
    label: "AlexZhangji/ufo-pursue-open-atlas",
    url: "https://github.com/AlexZhangji/ufo-pursue-open-atlas",
    result: "release_01_focused_no_release_03_classification_found",
    noteJa: "Release 01補助データ候補として確認済みですが、Release 03分類データは確認できませんでした。",
  },
  {
    source: "black_vault_internet_archive_github_mirrors",
    label: "The Black Vault / Internet Archive / GitHub mirrors",
    result: "used_as_archive_search_hints",
    noteJa: "個別資料の既公開照合候補として利用し、分類済み監査表としては扱っていません。",
  },
];

const externalAuditNote =
  "Release 03向けの既存の分類済み監査データは確認できなかったため、Ruppelt暫定照合として分類しました。";

const archiveUrls = {
  warGov: "https://www.war.gov/UFO/",
  ciaSearch: "https://www.cia.gov/readingroom/search/site/",
  fbiVault: "https://vault.fbi.gov/search?SearchableText=",
  nasaHistory: "https://www.nasa.gov/history/",
  aaro: "https://www.aaro.mil/",
  dvids: "https://www.dvidshub.net/search/?q=",
  internetArchive: "https://archive.org/search?query=",
};

function normalizeForUrl(value) {
  return encodeURIComponent(String(value || "").replace(/\s+/g, " ").trim());
}

function officialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || "";
}

function makeAttribution(source, sourceUrl, role = "ruppelt_review") {
  return {
    source,
    ...(sourceUrl ? { sourceUrl } : {}),
    role,
    visible: "secondary",
  };
}

function makeEvidence(type, label, url, noteJa, matchedFields = ["assetFileName"]) {
  return {
    type,
    label,
    ...(url ? { url } : {}),
    noteJa,
    matchedFields,
    confidence: "medium",
  };
}

function makeDisclosure(record, config) {
  const official = officialUrl(record);
  const evidence = [
    makeEvidence(
      "official_source",
      "PURSUE official",
      official || archiveUrls.warGov,
      "PURSUE Release 03の公式掲載資料として確認しました。",
      ["downloadUrl", "videoUrl", "imageUrl"],
    ),
    ...config.evidence,
  ];

  return {
    status: config.status,
    labelJa: statusLabels[config.status],
    confidence: config.confidence,
    evidenceSummaryJa: config.evidenceSummaryJa,
    evidence,
    attribution: config.attribution,
    checkedAt,
    checkedBy: "ruppelt",
    ruppeltVerified: false,
    manualReviewRequired: config.manualReviewRequired ?? true,
    reviewerNoteJa: `${externalAuditNote} ${config.reviewerNoteJa || ""}`.trim(),
    _audit: {
      existingClassificationDataset: "not_found",
      method: config.method,
    },
  };
}

function ciaDisclosure(record) {
  const title = record.source.assetFileName;
  const query = normalizeForUrl(title.replace(/^CIA-UAP-\d+,\s*/, ""));

  return makeDisclosure(record, {
    status: "previously_public",
    confidence: "medium",
    method: "cia_reading_room_catalog_or_known_public_document_match",
    evidenceSummaryJa: [
      "CIA Reading Room / CREST系の既公開資料または広く既公開のCIA史料として照合しました。",
      "PURSUE版ではUAP文脈の資料として再掲されています。",
    ],
    evidence: [
      makeEvidence(
        "archive_match",
        "CIA Reading Room search",
        `${archiveUrls.ciaSearch}${query}`,
        "タイトル・文書名でCIA Reading Room側の既公開資料を照合する候補があります。",
      ),
    ],
    attribution: [
      makeAttribution("cia_crest", `${archiveUrls.ciaSearch}${query}`, "official_archive"),
      makeAttribution("ruppelt"),
    ],
  });
}

function knownPublicHistoricalDisclosure(record, sourceLabel, sourceUrl, noteJa) {
  return makeDisclosure(record, {
    status: "previously_public",
    confidence: "medium",
    method: "historical_archive_or_catalog_match",
    evidenceSummaryJa: [noteJa, "PURSUE版ではUAP文脈の資料として再掲されています。"],
    evidence: [
      makeEvidence("archive_match", sourceLabel, sourceUrl, noteJa),
    ],
    attribution: [
      makeAttribution(
        sourceLabel.includes("NASA") ? "nasa" : sourceLabel.includes("FBI") ? "fbi_vault" : "internet_archive",
        sourceUrl,
        "official_archive",
      ),
      makeAttribution("ruppelt"),
    ],
  });
}

function partialHistoricalDisclosure(record, sourceLabel, sourceUrl, noteJa) {
  return makeDisclosure(record, {
    status: "partial",
    confidence: "medium",
    method: "case_or_source_material_public_but_pursue_package_not_fully_matched",
    evidenceSummaryJa: [noteJa, "同一PURSUEパッケージ全体の過去公開までは確認していません。"],
    evidence: [
      makeEvidence("catalog_match", sourceLabel, sourceUrl, noteJa),
    ],
    attribution: [
      makeAttribution(
        sourceLabel.includes("FBI") ? "fbi_vault" : sourceLabel.includes("NASA") ? "nasa" : "internet_archive",
        sourceUrl,
        "official_archive",
      ),
      makeAttribution("ruppelt"),
    ],
  });
}

function recentFirstTimeDisclosure(record, familyNote) {
  const title = record.source.assetFileName;
  const searchUrl =
    record.source.documentType === "VID" || record.source.documentType === "AUD"
      ? `${archiveUrls.dvids}${normalizeForUrl(title)}`
      : record.source.agency === "Department of War"
        ? archiveUrls.aaro
        : record.source.agency === "FBI"
          ? `${archiveUrls.fbiVault}${normalizeForUrl(title)}`
          : archiveUrls.warGov;

  return makeDisclosure(record, {
    status: "first_time_public",
    confidence: "low",
    method: "no_existing_prior_audit_or_same_file_match_found",
    evidenceSummaryJa: [
      familyNote,
      "既存の分類済み監査データやPURSUE以前の同一ファイル公開は確認できませんでした。",
    ],
    evidence: [
      makeEvidence(
        record.source.documentType === "VID" ? "video_match" : record.source.documentType === "IMG" ? "image_match" : "metadata_match",
        record.source.documentType === "VID" || record.source.documentType === "AUD" ? "DVIDS / archive search" : "Archive search",
        searchUrl,
        "同一資料の過去公開確認に使った検索候補です。明確な既公開一致は確認できませんでした。",
      ),
    ],
    attribution: [
      makeAttribution(record.source.documentType === "VID" || record.source.documentType === "AUD" ? "dvids" : "ruppelt", searchUrl, "auxiliary_archive"),
      makeAttribution("ruppelt"),
    ],
    reviewerNoteJa: "初公開の断定は避けるため信頼度は低にしています。",
  });
}

const release03Rules = {
  "pursue-0223": "cia",
  "pursue-0224": "armyHistorical",
  "pursue-0225": "recentFbiColorado",
  "pursue-0226": "recentFbiColorado",
  "pursue-0227": "recentFbiOrb",
  "pursue-0228": "recentFbiOrb",
  "pursue-0229": "partialFbiHistorical",
  "pursue-0230": "recentFbiOrbVideo",
  "pursue-0231": "recentFbiOrbVideo",
  "pursue-0232": "recentColoradoAnalysis",
  "pursue-0233": "robertsonPanel",
  "pursue-0234": "ciaOverhead",
  "pursue-0235": "cia",
  "pursue-0236": "cia",
  "pursue-0237": "cia",
  "pursue-0238": "cia",
  "pursue-0239": "cia",
  "pursue-0240": "cia",
  "pursue-0241": "cia",
  "pursue-0242": "cia",
  "pursue-0243": "cia",
  "pursue-0244": "cia",
  "pursue-0245": "cia",
  "pursue-0246": "blueBookSpecialReport",
  "pursue-0247": "cia",
  "pursue-0248": "cia",
  "pursue-0249": "cia",
  "pursue-0250": "recentWesternUs",
  "pursue-0251": "recentWesternUs",
  "pursue-0252": "recentWesternUs",
  "pursue-0253": "recentWesternUs",
  "pursue-0254": "recentWesternUs",
  "pursue-0255": "recentWesternUs",
  "pursue-0256": "recentWesternUs",
  "pursue-0257": "robertsonPanel",
  "pursue-0258": "navyHistorical",
  "pursue-0259": "partialBlueBookCases",
  "pursue-0260": "partialBlueBookCases",
  "pursue-0261": "recentFbiColorado",
  "pursue-0262": "recentFbiOrb",
  "pursue-0263": "recentFbiOrb",
  "pursue-0264": "recentFbiOrb",
  "pursue-0265": "recentFbiOrb",
  "pursue-0266": "recentFbiOrb",
  "pursue-0267": "partialFbiHistorical",
  "pursue-0268": "partialFbiHistorical",
  "pursue-0269": "recentWesternUs",
  "pursue-0270": "recentWesternUs",
  "pursue-0271": "recentWesternUs",
  "pursue-0272": "recentWesternUs",
  "pursue-0273": "recentWesternUs",
  "pursue-0274": "recentWesternUs",
  "pursue-0275": "recentWesternUs",
  "pursue-0276": "recentWesternUs",
  "pursue-0277": "recentWesternUs",
  "pursue-0278": "recentWesternUs",
  "pursue-0279": "recentFbiOrbVideo",
  "pursue-0280": "recentFbiOrbVideo",
  "pursue-0281": "recentWesternUs",
  "pursue-0282": "recentWesternUs",
  "pursue-0283": "nasaDebrief",
  "pursue-0284": "nasaDebrief",
  "pursue-0285": "nasaDebrief",
  "pursue-0286": "nasaDebrief",
  "pursue-0287": "nasaDebrief",
  "pursue-0288": "nasaDebrief",
  "pursue-0289": "nasaDebrief",
  "pursue-0290": "nasaDebrief",
  "pursue-0291": "partialNasaAudio",
  "pursue-0292": "nasaAudio",
  "pursue-0293": "nasaAudio",
  "pursue-0294": "partialGovernmentCorrespondence",
};

function buildByRule(record, rule) {
  const titleQuery = normalizeForUrl(record.source.assetFileName);

  switch (rule) {
    case "cia":
      return ciaDisclosure(record);
    case "robertsonPanel":
      return knownPublicHistoricalDisclosure(
        record,
        "CIA / Robertson Panel public references",
        `${archiveUrls.ciaSearch}${normalizeForUrl("Scientific Advisory Panel on Unidentified Flying Objects Robertson Panel")}`,
        "Robertson Panel / CIA Scientific Advisory Panel関連資料として過去公開情報が確認できる資料群です。",
      );
    case "ciaOverhead":
      return knownPublicHistoricalDisclosure(
        record,
        "CIA History Staff publication",
        `${archiveUrls.ciaSearch}${normalizeForUrl("Central Intelligence Agency and Overhead Reconnaissance U-2 OXCART Programs 1954 1974")}`,
        "CIA史料『The U-2 and OXCART Programs, 1954-1974』として既公開の出版・公開情報があります。",
      );
    case "blueBookSpecialReport":
      return knownPublicHistoricalDisclosure(
        record,
        "Project Blue Book / Internet Archive",
        `${archiveUrls.internetArchive}${normalizeForUrl("Project Blue Book Special Report No. 14 Analysis of Reports of Unidentified Aerial Objects")}`,
        "Project Blue Book Special Report No. 14は過去公開済みの代表的なUFO調査報告です。",
      );
    case "armyHistorical":
      return partialHistoricalDisclosure(
        record,
        "NARA / Internet Archive search",
        `${archiveUrls.internetArchive}${normalizeForUrl("US Army Flying Saucer Study 1949")}`,
        "1949年の米陸軍系飛行円盤研究として既公開アーカイブ照合候補があります。",
      );
    case "navyHistorical":
      return partialHistoricalDisclosure(
        record,
        "NARA / Internet Archive search",
        `${archiveUrls.internetArchive}${normalizeForUrl("US Navy Report of Flying Discs 1948")}`,
        "1948年の米海軍飛行円盤報告として既公開アーカイブ照合候補があります。",
      );
    case "partialBlueBookCases":
      return partialHistoricalDisclosure(
        record,
        "Project Blue Book archive search",
        `${archiveUrls.internetArchive}${normalizeForUrl(record.source.assetFileName)}`,
        "Project Blue Book / USAF系ケース資料として元資料群の既公開照合候補があります。",
      );
    case "partialFbiHistorical":
      return partialHistoricalDisclosure(
        record,
        "FBI Vault search",
        `${archiveUrls.fbiVault}${titleQuery}`,
        "1950年代から1960年代のFBI UFO関連ファイルとして既公開照合候補があります。",
      );
    case "nasaDebrief":
      return knownPublicHistoricalDisclosure(
        record,
        "NASA History / mission debriefing search",
        `${archiveUrls.nasaHistory}`,
        "NASAの有人宇宙飛行ミッション・デブリーフィングとして過去公開済みの資料群です。",
      );
    case "partialNasaAudio":
      return partialHistoricalDisclosure(
        record,
        "NASA History / audio archive search",
        `${archiveUrls.nasaHistory}`,
        "Gordon Cooper関連の発言・音声は既知ですが、PURSUE版の抜粋音声そのものの過去公開は未確認です。",
      );
    case "nasaAudio":
      return knownPublicHistoricalDisclosure(
        record,
        "NASA History / Apollo 16 audio",
        `${archiveUrls.nasaHistory}`,
        "Apollo 16科学デブリーフィング関連の音声・記録として過去公開済みの資料群です。",
      );
    case "partialGovernmentCorrespondence":
      return partialHistoricalDisclosure(
        record,
        "Government correspondence archive search",
        `${archiveUrls.internetArchive}${titleQuery}`,
        "1998年の議会・ホワイトハウス宛UFO関連書簡として既公開照合候補があります。",
      );
    case "recentFbiColorado":
      return recentFirstTimeDisclosure(record, "2022年Colorado Springs UAP関連のFBI報告・レンダリング資料です。");
    case "recentFbiOrb":
      return recentFirstTimeDisclosure(record, "2024-2026年のNortheastern Orb関連FBI報告資料です。");
    case "recentFbiOrbVideo":
      return recentFirstTimeDisclosure(record, "Northeastern Orb関連のPURSUE動画資料です。");
    case "recentColoradoAnalysis":
      return recentFirstTimeDisclosure(record, "Colorado Springs UAP Incidentの分析資料です。");
    case "recentWesternUs":
      return recentFirstTimeDisclosure(record, "Western United States Event関連のAARO/FBI資料またはデジタル再現資料です。");
    default:
      return makeDisclosure(record, {
        status: "unknown",
        confidence: "low",
        method: "no_rule",
        evidenceSummaryJa: ["既存監査データも十分な照合材料も確認できませんでした。"],
        evidence: [],
        attribution: [makeAttribution("ruppelt")],
      });
  }
}

async function readJsonOrEmpty(path) {
  return readFile(path, "utf8")
    .then((content) => JSON.parse(content))
    .catch(() => ({}));
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const existingPriorDisclosures = await readJsonOrEmpty(priorDisclosuresPath);
const release03Records = index.records.filter((record) => record.source.release === "6/12/26");

const release03Disclosures = {};
const auditRecords = [];

for (const record of release03Records) {
  const rule = release03Rules[record.source.id];
  const disclosure = buildByRule(record, rule);
  release03Disclosures[record.source.id] = disclosure;
  auditRecords.push({
    recordId: record.source.id,
    title: record.source.assetFileName,
    officialUrl: officialUrl(record),
    existingClassificationDataset: disclosure._audit.existingClassificationDataset,
    method: disclosure._audit.method,
    status: disclosure.status,
    confidence: disclosure.confidence,
    attributionSources: disclosure.attribution.map((item) => item.source),
    evidenceLabels: disclosure.evidence.map((item) => item.label),
  });
  delete disclosure._audit;
}

const mergedPriorDisclosures = {
  ...existingPriorDisclosures,
  ...release03Disclosures,
};

const statusCounts = Object.values(release03Disclosures).reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});

const audit = {
  generatedAt: checkedAt,
  release: "6/12/26",
  releaseId: "release_03",
  recordCount: release03Records.length,
  existingAuditSources,
  summary: {
    existingClassificationDatasetFound: 0,
    ruppeltTemporaryReviewCount: release03Records.length,
    statusCounts,
  },
  policy: {
    sourceOfTruth: "PURSUE / war.gov official metadata and official file links",
    priorDisclosureSourcePriority: [
      "machine-readable classification dataset",
      "audited prior-disclosure page",
      "official archive/catalog match",
      "auxiliary archive search",
      "news/research hints",
    ],
    release03Result:
      "No Release 03 classification dataset equivalent to the Release 01 external audit was found. Classifications are Ruppelt provisional review and should keep confidence/manual-review flags visible.",
  },
  records: auditRecords,
};

await writeFile(priorDisclosuresPath, `${JSON.stringify(mergedPriorDisclosures, null, 2)}\n`, "utf8");
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");

console.log(`Wrote ${priorDisclosuresPath}`);
console.log(`Wrote ${auditPath}`);
console.log(JSON.stringify({ release03Count: release03Records.length, statusCounts }, null, 2));
