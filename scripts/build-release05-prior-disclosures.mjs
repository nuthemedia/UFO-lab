import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");
const auditPath = resolve(rootDir, "data/pursue/release05-prior-disclosure-audit.json");
const checkedAt = "2026-08-08";

const statusLabels = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  unknown: "判定不能",
};

const sources = {
  official: "https://www.war.gov/UFO/?releaseDate=Release+05&release=05",
  nara: "https://www.archives.gov/research/topics/uaps/rg-collections",
  project1947: "https://www.project1947.com/gr/grchron3.htm",
  cia: "https://www.cia.gov/readingroom/collection/ufos-fact-or-fiction",
  fbi: "https://vault.fbi.gov/UFO",
};

const existingAuditSources = [
  {
    source: "they_are_here",
    label: "they-are-here.com",
    result: "no_release_05_classification_dataset_found",
    noteJa: "Release 05の個別監査ページまたは機械可読な分類表は確認できませんでした。",
  },
  {
    source: "abigailhaddad_ufo_releases",
    label: "abigailhaddad/ufo-releases",
    url: "https://github.com/abigailhaddad/ufo-releases",
    result: "metadata_and_ocr_only",
    noteJa: "Release 05のメタデータと一部OCRはありますが、既出・初出分類は含まれていません。",
  },
  {
    source: "public_archive_review",
    label: "NARA / CIA Reading Room / FBI Vault / DVIDS",
    result: "used_for_record_level_provisional_review",
    noteJa: "公的アーカイブと公式配信ページを資料単位の暫定照合に利用しました。",
  },
];

function officialUrl(record) {
  return record.source.downloadUrl || record.source.videoUrl || record.source.imageUrl || sources.official;
}

function dvidsUrl(record) {
  const id = record.source.videoUrl.match(/\/(\d+)\/?$/)?.[1];
  return id ? `https://www.dvidshub.net/video/${id}` : officialUrl(record);
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
        "PURSUE Release 05の公式掲載資料として確認しました。",
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
      "Release 05向けの既存分類済み監査表は確認できなかったため、Ruppelt暫定照合として分類しました。",
  };
}

const previousPublicEvidence = new Map([
  [
    "pursue-0335",
    {
      label: "National Archives UAP record groups",
      url: sources.nara,
      noteJa:
        "Montana（1950年）とUtah（1952年）のフィルムおよびProject Blue Book関連資料は、NARAのUAP資料群として以前から案内されています。",
      source: "nara",
    },
  ],
  [
    "pursue-0348",
    {
      label: "Project 1947 Ghost Rocket chronology",
      url: sources.project1947,
      noteJa:
        "1947年1月のIntelligence Review掲載「Ghost Rockets Over Scandinavia」は、PURSUE以前から同題・同内容で参照可能でした。",
      source: "research_site",
    },
  ],
  [
    "pursue-0349",
    {
      label: "National Archives UAP record groups",
      url: sources.nara,
      noteJa:
        "Project SignとAir Materiel Commandの1947〜1948年資料は、NARAのUAP・Project Blue Book関連資料群として既公開です。",
      source: "nara",
    },
  ],
]);

const uncertainHistoricalSources = new Map([
  ["pursue-0344", { label: "CIA Reading Room UFO collection", url: sources.cia, source: "cia_crest" }],
  ["pursue-0345", { label: "CIA Reading Room UFO collection", url: sources.cia, source: "cia_crest" }],
  ["pursue-0346", { label: "National Archives UAP record groups", url: sources.nara, source: "nara" }],
  ["pursue-0347", { label: "National Archives UAP record groups", url: sources.nara, source: "nara" }],
  ["pursue-0366", { label: "National Archives UAP record groups", url: sources.nara, source: "nara" }],
]);

function classify(record) {
  const previous = previousPublicEvidence.get(record.source.id);

  if (previous) {
    return makeDisclosure(record, {
      status: "previously_public",
      confidence: "medium",
      summary: [
        "同一資料または同題・同内容の資料がPURSUE以前からアーカイブや研究資料で参照可能です。",
        "PURSUE版ではUAP関連資料として再掲されています。",
      ],
      evidenceType: "archive_match",
      evidenceLabel: previous.label,
      evidenceUrl: previous.url,
      evidenceNoteJa: previous.noteJa,
      attributionSource: previous.source,
      attributionRole:
        previous.source === "research_site" ? "research_analysis" : "official_archive",
    });
  }

  const uncertain = uncertainHistoricalSources.get(record.source.id);

  if (uncertain) {
    return makeDisclosure(record, {
      status: "unknown",
      confidence: "low",
      summary: [
        "関連する歴史資料群は公開されていますが、PURSUE版と同一のファイルが以前から公開されていたか確認できませんでした。",
        "直接一致を確認できないため、初公開・既公開の断定を避けています。",
      ],
      evidenceType: "manual_review",
      evidenceLabel: uncertain.label,
      evidenceUrl: uncertain.url,
      evidenceNoteJa: "関連資料群を照合しましたが、同一ファイルへの直接リンクは確認できませんでした。",
      attributionSource: uncertain.source,
      attributionRole: "official_archive",
    });
  }

  const isVideo = record.source.documentType === "VID";
  const isRendering = /Digital Rendering/i.test(record.source.assetFileName);
  const evidenceUrl = isVideo ? dvidsUrl(record) : officialUrl(record);

  return makeDisclosure(record, {
    status: "first_time_public",
    confidence: isRendering ? "medium" : "low",
    summary: isRendering
      ? [
          "公式資料説明では、PURSUEを支援する視覚資料として2026年に作成されたデジタルレンダリングです。",
          "PURSUE以前の同一画像または同一ファイル公開は確認できませんでした。",
        ]
      : [
          "PURSUE以前の同一ファイル公開は、公的アーカイブと公式配信ページで確認できませんでした。",
          "先行公開が存在しないことを完全には証明できないため、信頼度は低としています。",
        ],
    evidenceType: isVideo ? "video_match" : "manual_review",
    evidenceLabel: isVideo ? "DVIDS official video" : "PURSUE file review",
    evidenceUrl,
    evidenceNoteJa: isVideo
      ? "DVIDSの公式動画ページと公開資料名を照合し、PURSUE以前の同一動画公開を確認できませんでした。"
      : "公式資料名・文書種別・事件情報を照合し、PURSUE以前の同一ファイル公開を確認できませんでした。",
    attributionSource: isVideo ? "dvids" : "ruppelt",
    attributionRole: isVideo ? "official_archive" : "ruppelt_review",
  });
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const existing = JSON.parse(await readFile(priorDisclosuresPath, "utf8").catch(() => "{}"));
const releaseRecords = index.records.filter(
  (record) => record.searchFacets?.releaseId === "release_05",
);
const generated = Object.fromEntries(
  releaseRecords.map((record) => [record.source.id, classify(record)]),
);

if (releaseRecords.length !== 41 || Object.keys(generated).length !== 41) {
  throw new Error(`Expected 41 Release 05 classifications, found ${Object.keys(generated).length}.`);
}

const statusCounts = Object.values(generated).reduce((counts, item) => {
  counts[item.status] = (counts[item.status] || 0) + 1;
  return counts;
}, {});
const audit = {
  generatedAt: checkedAt,
  release: "8/7/26",
  releaseId: "release_05",
  recordCount: 41,
  existingAuditSources,
  summary: {
    existingClassificationDatasetFound: 0,
    ruppeltTemporaryReviewCount: 41,
    statusCounts,
  },
  policy: {
    sourceOfTruth: "PURSUE / war.gov official metadata and official file links",
    release05Result:
      "No Release 05 classification dataset equivalent to the Release 01 external audit was found. All classifications are provisional and require manual review.",
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

console.log(JSON.stringify({ release05Count: releaseRecords.length, statusCounts }, null, 2));
