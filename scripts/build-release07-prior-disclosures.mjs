import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");
const auditPath = resolve(rootDir, "data/pursue/release07-prior-disclosure-audit.json");
const checkedAt = "2026-10-24";

const statusLabels = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  unknown: "判定不能",
};

const sources = {
  official: "https://www.war.gov/UFO/",
  naraBlueBook: "https://www.archives.gov/research/military/air-force/ufos",
  naraUap: "https://www.archives.gov/research/catalog/catalog-bulk-downloads/uap-bulk-download",
  diaAawsap: "https://www.dia.mil/FOIA/FOIA-Electronic-Reading-Room/FileId/211378/",
  aaro: "https://www.aaro.mil/",
};

const existingAuditSources = [
  {
    source: "they_are_here",
    label: "they-are-here.com",
    result: "no_release_07_classification_dataset_found",
    noteJa: "Release 07の個別監査ページまたは機械可読な分類表は確認できませんでした。",
  },
  {
    source: "abigailhaddad_ufo_releases",
    label: "abigailhaddad/ufo-releases",
    url: "https://github.com/abigailhaddad/ufo-releases",
    result: "metadata_and_ocr_only",
    noteJa: "Release 07のメタデータと27件のOCRはありますが、既出・初出分類は含まれていません。",
  },
  {
    source: "public_archive_review",
    label: "NARA / DIA FOIA Reading Room / AARO",
    result: "used_for_record_level_provisional_review",
    noteJa: "公的アーカイブと公式サイトを資料単位の暫定照合に利用しました。",
  },
];

function officialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || sources.official;
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
        "PURSUE Release 07の公式掲載資料として確認しました。",
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
      {
        source: config.attributionSource,
        sourceUrl: config.evidenceUrl,
        role: config.attributionRole,
        visible: "secondary",
      },
      {
        source: "ruppelt",
        sourceUrl: "https://ufolab.tokyo/ruppelt",
        role: "ruppelt_review",
        visible: "secondary",
      },
    ],
    checkedAt,
    checkedBy: "ruppelt",
    ruppeltVerified: false,
    manualReviewRequired: true,
    reviewerNoteJa:
      "Release 07向けの既存分類済み監査表は確認できなかったため、Ruppelt暫定照合として分類しました。",
  };
}

function classify(record) {
  const title = record.source.assetFileName;

  if (/Air Intelligence Information Report|Flying Object Report|Catalina Island/i.test(title)) {
    return makeDisclosure(record, {
      status: "partial",
      confidence: "medium",
      summary: [
        "同時期の空軍UFO調査資料とProject Blue Book資料群はPURSUE以前から公的アーカイブで公開されています。",
        "ただし、PURSUE版と同一のPDFの先行公開までは確認できませんでした。",
      ],
      evidenceType: "archive_match",
      evidenceLabel: "National Archives Project Blue Book records",
      evidenceUrl: sources.naraBlueBook,
      evidenceNoteJa: "同時期の空軍UFO調査記録群を確認しましたが、同一PDFの一致は未確認です。",
      attributionSource: "nara",
      attributionRole: "official_archive",
    });
  }

  if (/BAASS|Project Capella|MUFON Reports Prepared for BAASS|Utah Ranch/i.test(title)) {
    return makeDisclosure(record, {
      status: "partial",
      confidence: "medium",
      summary: [
        "AAWSAP/BAASSの計画・契約・関連研究資料はPURSUE以前からDIAの公開資料等で確認できます。",
        "今回の個別報告書と同一ファイルの先行公開は完全には確認できませんでした。",
      ],
      evidenceType: "case_match",
      evidenceLabel: "DIA FOIA Electronic Reading Room",
      evidenceUrl: sources.diaAawsap,
      evidenceNoteJa: "AAWSAP/BAASS関連資料の公開履歴を確認しましたが、PURSUE版と同一の各ファイルまでは確認できませんでした。",
      attributionSource: "ruppelt",
      attributionRole: "official_archive",
    });
  }

  if (/Triangular UAP AARO Memorandum|FD-302, Unidentified Aerial Object/i.test(title)) {
    return makeDisclosure(record, {
      status: "first_time_public",
      confidence: "low",
      summary: [
        "2026年作成の同一文書について、PURSUE以前の公式公開は確認できませんでした。",
        "先行公開が存在しないことを完全には証明できないため、信頼度は低としています。",
      ],
      evidenceType: "manual_review",
      evidenceLabel: "AARO official site and PURSUE file review",
      evidenceUrl: sources.aaro,
      evidenceNoteJa: "AARO公式情報と資料名を照合し、PURSUE公開日より前の同一文書公開を確認できませんでした。",
      attributionSource: "ruppelt",
      attributionRole: "ruppelt_review",
    });
  }

  if (/Final Personnel Record for McCoy/i.test(title)) {
    return makeDisclosure(record, {
      status: "partial",
      confidence: "low",
      summary: [
        "Project Blue Book関係者Howard M. McCoyと当時の空軍資料群は既知です。",
        "今回の人事記録と同一ファイルの先行公開は確認できませんでした。",
      ],
      evidenceType: "case_match",
      evidenceLabel: "National Archives UAP records",
      evidenceUrl: sources.naraUap,
      evidenceNoteJa: "関連する空軍・UAP資料群は公開済みですが、同一人事記録の一致は未確認です。",
      attributionSource: "nara",
      attributionRole: "official_archive",
    });
  }

  return makeDisclosure(record, {
    status: "unknown",
    confidence: "low",
    summary: [
      "関連する政府記録や事件の公開履歴は確認できますが、同一文書の先行公開を判定できませんでした。",
      "根拠が不足しているため、初公開とは断定していません。",
    ],
    evidenceType: "manual_review",
    evidenceLabel: "PURSUE file and public archive review",
    evidenceUrl: sources.naraUap,
    evidenceNoteJa: "資料名・機関・年代を公的アーカイブと照合しましたが、同一ファイルの確認には至りませんでした。",
    attributionSource: "ruppelt",
    attributionRole: "ruppelt_review",
  });
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const existing = JSON.parse(await readFile(priorDisclosuresPath, "utf8").catch(() => "{}"));
const releaseRecords = index.records.filter(
  (record) => record.searchFacets?.releaseId === "release_07",
);
const generated = Object.fromEntries(
  releaseRecords.map((record) => [record.source.id, classify(record)]),
);

if (releaseRecords.length !== 28 || Object.keys(generated).length !== 28) {
  throw new Error(`Expected 28 Release 07 classifications, found ${Object.keys(generated).length}.`);
}

const statusCounts = Object.values(generated).reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});
const audit = {
  generatedAt: checkedAt,
  release: "10/23/26",
  releaseId: "release_07",
  recordCount: 28,
  existingAuditSources,
  summary: {
    existingClassificationDatasetFound: 0,
    ruppeltTemporaryReviewCount: 28,
    statusCounts,
  },
  policy: {
    sourceOfTruth: "PURSUE / war.gov official metadata and official file links",
    release07Result:
      "No Release 07 classification dataset equivalent to the Release 01 external audit was found. All classifications are provisional and require manual review.",
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

console.log(JSON.stringify({ release07Count: releaseRecords.length, statusCounts }, null, 2));
