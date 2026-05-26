import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const translationsPath = resolve(rootDir, "data/pursue/pursue-translations.ja.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");

const raw = JSON.parse(await readFile(recordsPath, "utf8"));
const translations = JSON.parse(await readFile(translationsPath, "utf8"));
const priorDisclosures = JSON.parse(await readFile(priorDisclosuresPath, "utf8"));

const priorDisclosureLabels = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  known_case_new_file: "事件は既知・資料は初公開",
  unknown: "判定不能",
};

function getReleaseId(record) {
  return record.source.release.includes("5/22") ? "release_02" : "release_01";
}

function makeDefaultPriorDisclosure(record) {
  return {
    status: "unknown",
    labelJa: priorDisclosureLabels.unknown,
    confidence: "low",
    evidenceSummaryJa: [],
    evidence: [],
    attribution: [
      {
        source: "ruppelt",
        role: "ruppelt_review",
        visible: "secondary",
      },
    ],
    ruppeltVerified: false,
    manualReviewRequired: true,
    reviewerNoteJa:
      getReleaseId(record) === "release_02"
        ? "Release 02 はRuppelt側での公開状況照合が未完了です。"
        : "公開状況の照合データがまだ登録されていません。",
  };
}

function normalizePriorDisclosure(record) {
  const disclosure = priorDisclosures[record.source.id];

  if (!disclosure) {
    return null;
  }

  const fallback = makeDefaultPriorDisclosure(record);
  const status = disclosure.status && disclosure.status !== "data_issue" ? disclosure.status : "unknown";
  const normalized = {
    ...fallback,
    ...disclosure,
    status,
    labelJa: disclosure.labelJa || priorDisclosureLabels[status] || priorDisclosureLabels.unknown,
    confidence: disclosure.confidence || "low",
    evidenceSummaryJa: disclosure.evidenceSummaryJa || [],
    evidence: disclosure.evidence || [],
    attribution: disclosure.attribution || fallback.attribution,
    ruppeltVerified: Boolean(disclosure.ruppeltVerified),
    manualReviewRequired: Boolean(disclosure.manualReviewRequired),
  };

  if (normalized.status === "unknown") {
    normalized.labelJa = priorDisclosureLabels.unknown;
  }

  return normalized;
}

function makeSearchFacets(record, priorDisclosure) {
  return {
    releaseId: getReleaseId(record),
    priorDisclosureStatus: priorDisclosure?.status,
    priorDisclosureConfidence: priorDisclosure?.confidence,
    ruppeltVerified: Boolean(priorDisclosure?.ruppeltVerified),
    manualReviewRequired: priorDisclosure ? Boolean(priorDisclosure.manualReviewRequired) : true,
    hasPriorDisclosureEvidence:
      Boolean(priorDisclosure) &&
      (priorDisclosure.evidenceSummaryJa.length > 0 || priorDisclosure.evidence.length > 0),
    attributionSources: priorDisclosure?.attribution.map((item) => item.source) || [],
  };
}

const mergedRecords = raw.records.map((record) => {
  const translation = translations[record.source.id] || {};
  const priorDisclosure = normalizePriorDisclosure(record);
  const { priorDisclosure: _oldPriorDisclosure, searchFacets: _oldSearchFacets, ...baseRecord } = record;

  return {
    ...baseRecord,
    documentId: record.documentId || record.source.id,
    ja: {
      assetFileNameJa: translation.assetFileNameJa || "",
      releaseJa: translation.releaseJa || "",
      agencyJa: translation.agencyJa || "",
      incidentLocationJa: translation.incidentLocationJa || "",
      documentTypeJa: translation.documentTypeJa || "",
      descriptionJa: translation.descriptionJa || "",
    },
    ...(priorDisclosure ? { priorDisclosure } : {}),
    searchFacets: makeSearchFacets(record, priorDisclosure),
  };
});

const untranslatedCount = mergedRecords.filter((record) => !record.ja.assetFileNameJa && !record.ja.descriptionJa).length;

const merged = {
  ...raw,
  metadata: {
    ...raw.metadata,
    untranslatedCount,
  },
  records: mergedRecords,
};

await writeFile(recordsPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log(`Wrote ${recordsPath}`);
