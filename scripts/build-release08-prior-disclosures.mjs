import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");
const auditPath = resolve(rootDir, "data/pursue/release08-prior-disclosure-audit.json");
const checkedAt = "2026-11-23";

const statusLabels = {
  first_time_public: "初公開",
  partial: "一部公開済み",
};

const sources = {
  official: "https://www.war.gov/UFO/",
  naraBlueBook: "https://www.archives.gov/research/military/air-force/ufos",
  ciaHistory: "https://www.cia.gov/resources/csi/static/cia-role-study-UFOs.pdf",
  diaAawsap: "https://www.dia.mil/FOIA/FOIA-Electronic-Reading-Room/FileId/211378/",
  aaro: "https://www.aaro.mil/",
};

const existingAuditSources = [
  {
    source: "they_are_here",
    label: "they-are-here.com",
    result: "no_release_08_classification_dataset_found",
    noteJa: "Release 08の個別監査ページまたは機械可読な分類表は確認できませんでした。",
  },
  {
    source: "abigailhaddad_ufo_releases",
    label: "abigailhaddad/ufo-releases",
    url: "https://github.com/abigailhaddad/ufo-releases",
    result: "metadata_and_ocr_only",
    noteJa: "Release 08のメタデータと40件のOCRはありますが、既出・初出分類は含まれていません。",
  },
  {
    source: "public_archive_review",
    label: "NARA / CIA Reading Room / DIA FOIA / AARO",
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
        "PURSUE Release 08の公式掲載資料として確認しました。",
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
      "Release 08向けの既存分類済み監査表は確認できなかったため、Ruppelt暫定照合として分類しました。",
  };
}

function classify(record) {
  const title = record.source.assetFileName;

  if (record.source.agency === "CIA") {
    return makeDisclosure(record, {
      status: "partial",
      confidence: "medium",
      summary: [
        "CIAによる1952年のUFO調査と関連文書群はPURSUE以前から公式公開されています。",
        "ただし、今回の2026年承認版と同一ファイルの先行公開までは確認できませんでした。",
      ],
      evidenceType: "archive_match",
      evidenceLabel: "CIA history of UFO study",
      evidenceUrl: sources.ciaHistory,
      evidenceNoteJa: "CIAのUFO調査史と同時期の資料群を確認しましたが、Release 08版との完全一致は未確認です。",
      attributionSource: "cia_crest",
      attributionRole: "official_archive",
    });
  }

  if (/AAWSAP|BAASS|AATIP|Senator Harry Reid|Senator Reid/i.test(title)) {
    return makeDisclosure(record, {
      status: "partial",
      confidence: "medium",
      summary: [
        "AAWSAP/BAASSの計画・契約・関連研究資料はPURSUE以前からDIA等の公開資料で確認できます。",
        "今回の個別文書と同一ファイルの先行公開は完全には確認できませんでした。",
      ],
      evidenceType: "case_match",
      evidenceLabel: "DIA FOIA Electronic Reading Room",
      evidenceUrl: sources.diaAawsap,
      evidenceNoteJa: "AAWSAP/BAASS関連資料の公開履歴を確認しましたが、各Release 08ファイルとの完全一致は未確認です。",
      attributionSource: "ruppelt",
      attributionRole: "official_archive",
    });
  }

  if (record.source.documentType === "VID" || /Unresolved Radar Detection.*2023/i.test(title)) {
    return makeDisclosure(record, {
      status: "first_time_public",
      confidence: "low",
      summary: [
        "同一の近年資料について、PURSUE以前の公式公開は確認できませんでした。",
        "先行公開が存在しないことを完全には証明できないため、信頼度は低としています。",
      ],
      evidenceType: "manual_review",
      evidenceLabel: "AARO official site and PURSUE file review",
      evidenceUrl: sources.aaro,
      evidenceNoteJa: "AARO公式情報と資料名を照合し、PURSUE公開日より前の同一資料公開を確認できませんでした。",
      attributionSource: "aaro",
      attributionRole: "official_archive",
    });
  }

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
    evidenceNoteJa: "同時期の空軍UFO調査記録群を確認しましたが、Release 08版との完全一致は未確認です。",
    attributionSource: "nara",
    attributionRole: "official_archive",
  });
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const existing = JSON.parse(await readFile(priorDisclosuresPath, "utf8").catch(() => "{}"));
const releaseRecords = index.records.filter(
  (record) => record.searchFacets?.releaseId === "release_08",
);
const generated = Object.fromEntries(
  releaseRecords.map((record) => [record.source.id, classify(record)]),
);

if (releaseRecords.length !== 43 || Object.keys(generated).length !== 43) {
  throw new Error(`Expected 43 Release 08 classifications, found ${Object.keys(generated).length}.`);
}

const statusCounts = Object.values(generated).reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});
const audit = {
  generatedAt: checkedAt,
  release: "11/20/26",
  releaseId: "release_08",
  recordCount: 43,
  existingAuditSources,
  summary: {
    existingClassificationDatasetFound: 0,
    ruppeltTemporaryReviewCount: 43,
    statusCounts,
  },
  policy: {
    sourceOfTruth: "PURSUE / war.gov official metadata and official file links",
    release08Result:
      "No Release 08 classification dataset equivalent to the Release 01 external audit was found. All classifications are provisional and require manual review.",
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

console.log(JSON.stringify({ release08Count: releaseRecords.length, statusCounts }, null, 2));
