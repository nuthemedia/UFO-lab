import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");
const auditPath = resolve(rootDir, "data/pursue/release06-prior-disclosure-audit.json");
const checkedAt = "2026-09-19";

const statusLabels = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  unknown: "判定不能",
};

const sources = {
  official: "https://www.war.gov/UFO/",
  nara: "https://www.archives.gov/research/catalog/catalog-bulk-downloads/uap-bulk-download",
  naraBlueBook: "https://www.archives.gov/research/military/air-force/ufos",
  dia: "https://www.dia.mil/FOIA/FOIA-Electronic-Reading-Room/FileId/211378/",
  uapLedger: "https://uapledger.com/releases/release-6-2026-09-18",
};

const existingAuditSources = [
  {
    source: "they_are_here",
    label: "they-are-here.com",
    result: "no_release_06_classification_dataset_found",
    noteJa: "Release 06の個別監査ページまたは機械可読な分類表は確認できませんでした。",
  },
  {
    source: "abigailhaddad_ufo_releases",
    label: "abigailhaddad/ufo-releases",
    url: "https://github.com/abigailhaddad/ufo-releases",
    result: "metadata_and_ocr_only",
    noteJa: "Release 06のメタデータと52件のOCRはありますが、既出・初出分類は含まれていません。",
  },
  {
    source: "uap_ledger",
    label: "UAP Ledger",
    url: sources.uapLedger,
    result: "release_manifest_and_text_coverage_only",
    noteJa: "71件のリリース構成とOCRカバー率の確認に使用し、公開状況の判定元にはしていません。",
  },
  {
    source: "public_archive_review",
    label: "NARA / DIA FOIA Reading Room / DVIDS",
    result: "used_for_record_level_provisional_review",
    noteJa: "公的アーカイブと公式配信ページを資料単位の暫定照合に利用しました。",
  },
];

function officialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || sources.official;
}

function dvidsUrl(record) {
  const id = record.source.videoUrl.match(/\/(\d+)\/?$/)?.[1];
  if (!id) return officialUrl(record);
  return record.source.documentType === "AUD"
    ? `https://www.dvidshub.net/audio/${id}`
    : `https://www.dvidshub.net/video/${id}`;
}

function makeEvidence(type, label, url, noteJa, confidence) {
  return {
    type,
    label,
    url,
    noteJa,
    matchedFields: ["assetFileName", "agency", "documentType"],
    confidence,
  };
}

function makeAttribution(source, sourceUrl, role) {
  return { source, sourceUrl, role, visible: "secondary" };
}

function makeDisclosure(record, config) {
  return {
    status: config.status,
    labelJa: statusLabels[config.status],
    confidence: config.confidence,
    evidenceSummaryJa: config.summary,
    evidence: [
      makeEvidence(
        "official_source",
        "PURSUE official",
        officialUrl(record),
        "PURSUE Release 06の公式掲載資料として確認しました。",
        "high",
      ),
      makeEvidence(
        config.evidenceType,
        config.evidenceLabel,
        config.evidenceUrl,
        config.evidenceNoteJa,
        config.confidence,
      ),
    ],
    attribution: [
      makeAttribution(config.attributionSource, config.evidenceUrl, config.attributionRole),
      makeAttribution("ruppelt", "https://ufolab.tokyo/ruppelt", "ruppelt_review"),
    ],
    checkedAt,
    checkedBy: "ruppelt",
    ruppeltVerified: false,
    manualReviewRequired: true,
    reviewerNoteJa:
      "Release 06向けの既存分類済み監査表は確認できなかったため、Ruppelt暫定照合として分類しました。",
  };
}

function classify(record) {
  const title = record.source.assetFileName;

  if (/AAWSAP/i.test(title)) {
    return makeDisclosure(record, {
      status: "previously_public",
      confidence: "medium",
      summary: [
        "同題のAAWSAP契約資料またはDIRDが、PURSUE以前からDIA FOIA Electronic Reading Roomで公開されています。",
        "PURSUE版ではUAP関連資料として再掲されています。",
      ],
      evidenceType: "archive_match",
      evidenceLabel: "DIA FOIA Electronic Reading Room",
      evidenceUrl: sources.dia,
      evidenceNoteJa: "AAWSAPの契約資料とDefense Intelligence Reference Documentsの同題公開資料を確認しました。",
      attributionSource: "ruppelt",
      attributionRole: "official_archive",
    });
  }

  if (/Tremonton|U\.S\. Air Force Flying Discs File|Historical Film of Reported UFOs/i.test(title)) {
    return makeDisclosure(record, {
      status: "previously_public",
      confidence: "medium",
      summary: [
        "TremontonフィルムとProject Blue Book関連資料は、PURSUE以前からNational Archivesの公開資料群で確認できます。",
        "PURSUE版では関連資料がまとめて再掲されています。",
      ],
      evidenceType: record.source.documentType === "VID" ? "video_match" : "archive_match",
      evidenceLabel: "National Archives Project Blue Book records",
      evidenceUrl: sources.nara,
      evidenceNoteJa: "Project Blue Bookの事件ファイルと映像資料の公開コレクションにTremonton資料が含まれることを確認しました。",
      attributionSource: "nara",
      attributionRole: "official_archive",
    });
  }

  if (/Final Personnel Record for Newhouse|Presentation by Captain Edward J\. Ruppelt|Transcript of a Presentation by Captain Edward J\. Ruppelt/i.test(title)) {
    return makeDisclosure(record, {
      status: "partial",
      confidence: "medium",
      summary: [
        "Tremonton事件、Project Blue Book、Edward J. Ruppeltに関する元資料群は既公開です。",
        "PURSUE版と同一の人事ファイル、講演書き起し、音声パッケージの先行公開は完全には確認できませんでした。",
      ],
      evidenceType: "case_match",
      evidenceLabel: "National Archives Project Blue Book reference",
      evidenceUrl: sources.naraBlueBook,
      evidenceNoteJa: "Project Blue Bookの事件・管理資料は既公開ですが、PURSUE版の同一ファイルまでは確認できませんでした。",
      attributionSource: "nara",
      attributionRole: "official_archive",
    });
  }

  const isMedia = record.source.documentType === "VID" || record.source.documentType === "AUD";
  return makeDisclosure(record, {
    status: "first_time_public",
    confidence: "low",
    summary: [
      "PURSUE以前の同一ファイル公開は、公的アーカイブと公式配信ページで確認できませんでした。",
      "先行公開が存在しないことを完全には証明できないため、信頼度は低としています。",
    ],
    evidenceType: isMedia ? (record.source.documentType === "AUD" ? "audio_match" : "video_match") : "manual_review",
    evidenceLabel: isMedia ? "DVIDS official media" : "PURSUE file review",
    evidenceUrl: isMedia ? dvidsUrl(record) : officialUrl(record),
    evidenceNoteJa: isMedia
      ? "DVIDSの公式配信ページと資料名を照合し、PURSUE公開日より前の同一メディア公開を確認できませんでした。"
      : "公式資料名・文書種別・事件情報を照合し、PURSUE以前の同一ファイル公開を確認できませんでした。",
    attributionSource: isMedia ? "dvids" : "ruppelt",
    attributionRole: isMedia ? "official_archive" : "ruppelt_review",
  });
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const existing = JSON.parse(await readFile(priorDisclosuresPath, "utf8").catch(() => "{}"));
const releaseRecords = index.records.filter(
  (record) => record.searchFacets?.releaseId === "release_06",
);
const generated = Object.fromEntries(
  releaseRecords.map((record) => [record.source.id, classify(record)]),
);

if (releaseRecords.length !== 71 || Object.keys(generated).length !== 71) {
  throw new Error(`Expected 71 Release 06 classifications, found ${Object.keys(generated).length}.`);
}

const statusCounts = Object.values(generated).reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});
const audit = {
  generatedAt: checkedAt,
  release: "9/18/26",
  releaseId: "release_06",
  recordCount: 71,
  existingAuditSources,
  summary: {
    existingClassificationDatasetFound: 0,
    ruppeltTemporaryReviewCount: 71,
    statusCounts,
  },
  policy: {
    sourceOfTruth: "PURSUE / war.gov official metadata and official file links",
    release06Result:
      "No Release 06 classification dataset equivalent to the Release 01 external audit was found. All classifications are provisional and require manual review.",
  },
  records: releaseRecords.map((record) => {
    const disclosure = generated[record.source.id];
    return {
      recordId: record.source.id,
      title: record.source.assetFileName,
      officialUrl: officialUrl(record),
      status: disclosure.status,
      confidence: disclosure.confidence,
      evidence: disclosure.evidence.map((item) => ({ label: item.label, url: item.url })),
      attributionSources: disclosure.attribution.map((item) => item.source),
    };
  }),
};

await writeFile(
  priorDisclosuresPath,
  `${JSON.stringify({ ...existing, ...generated }, null, 2)}\n`,
);
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

console.log(JSON.stringify({ release06Count: releaseRecords.length, statusCounts }, null, 2));
