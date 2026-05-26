import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const priorDisclosuresPath = resolve(rootDir, "data/pursue/prior-disclosures.json");

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const priorDisclosures = JSON.parse(await readFile(priorDisclosuresPath, "utf8"));

const labels = {
  first_time_public: "初公開",
  previously_public: "既に公開済み",
  partial: "一部公開済み",
  unknown: "判定不能",
};

const officialWarPage = "https://www.war.gov/UFO/?releaseDate=Release+02";
const release02ResearchNotes = {
  military_video:
    "war.gov / DVIDS上のRelease 02公式動画として確認。PURSUE以前の同一動画公開は確認できなかったため、暫定的に初公開扱い。",
  weak_military_video:
    "war.gov / DVIDS上のRelease 02公式動画として確認したが、日付・場所などの照合メタデータが不足、または公式URLの重複があり、PURSUE以前の公開状況を十分に判定できないため判定不能扱い。",
  nasa_audio:
    "NASAのミッション記録・トランスクリプトとして関連する交信内容は既公開だが、PURSUE版の音声抜粋ファイルそのものの過去公開は確認できないため、一部公開済み扱い。",
  sandia:
    "Sandia Base / green fireball系の歴史資料として関連事件は既知。PURSUE版PDFそのものの過去公開は確認できないため、一部公開済み扱い。",
  pantex:
    "Pantex未確認物体インシデント資料はPURSUE以前から外部公開資料として確認できるため、既に公開済み扱い。",
  usper:
    "2025年のUSPERナラティブ資料。PURSUE以前の同一資料公開は確認できないため、暫定的に初公開扱い。",
  unknown:
    "公式Release 02資料として確認したが、PURSUE以前の同一資料公開状況を十分に照合できないため、判定不能扱い。",
};

const manualOverrides = {
  "pursue-0161": {
    status: "partial",
    confidence: "medium",
    note: release02ResearchNotes.sandia,
    evidenceType: "case_match",
    source: "ruppelt",
  },
  "pursue-0162": {
    status: "unknown",
    confidence: "low",
    note: release02ResearchNotes.unknown,
    evidenceType: "manual_review",
    source: "ruppelt",
  },
  "pursue-0163": {
    status: "first_time_public",
    confidence: "low",
    note: release02ResearchNotes.usper,
    evidenceType: "manual_review",
    source: "ruppelt",
  },
  "pursue-0164": {
    status: "partial",
    confidence: "medium",
    note: release02ResearchNotes.nasa_audio,
    evidenceType: "archive_match",
    source: "nasa",
  },
  "pursue-0165": {
    status: "previously_public",
    confidence: "medium",
    note: release02ResearchNotes.pantex,
    evidenceType: "file_match",
    source: "black_vault",
    sourceUrl: "https://documents2.theblackvault.com/documents/nnsa/24-00120-LB.pdf",
  },
  "pursue-0166": {
    status: "partial",
    confidence: "low",
    note: "James Tuck / Los Alamos周辺のUAP関心や関連文脈はPURSUE以前から確認できるが、PURSUE版PDFそのものの既公開は確認できないため、一部公開済み扱い。",
    evidenceType: "case_match",
    source: "ruppelt",
  },
  "pursue-0167": {
    status: "unknown",
    confidence: "low",
    note: release02ResearchNotes.unknown,
    evidenceType: "manual_review",
    source: "ruppelt",
  },
};

const nasaAudioRecordIds = new Set(["pursue-0217", "pursue-0218", "pursue-0219", "pursue-0220", "pursue-0221", "pursue-0222"]);

function getVideoUrl(record) {
  const id = record.source.videoUrl.match(/\/(\d+)\/?$/)?.[1];
  return id ? `https://www.dvidshub.net/video/${id}` : record.source.videoUrl;
}

const release02Records = index.records.filter((record) => record.source.release === "5/22/26");
const videoUrlCounts = release02Records.reduce((counts, record) => {
  if (record.source.videoUrl) {
    counts[record.source.videoUrl] = (counts[record.source.videoUrl] || 0) + 1;
  }

  return counts;
}, {});

function isWeakDowVideo(record) {
  return (
    record.source.agency === "Department of War" &&
    record.source.documentType === "VID" &&
    (!record.source.incidentDate || !record.source.incidentLocation || videoUrlCounts[record.source.videoUrl] > 1)
  );
}

function makeDisclosure(record, config) {
  const officialUrl = record.source.downloadUrl || getVideoUrl(record);
  const attributionSource = config.source || (record.source.documentType === "VID" ? "dvids" : "ruppelt");
  const attributionRole = attributionSource === "ruppelt" ? "ruppelt_review" : "official_archive";

  return {
    status: config.status,
    labelJa: labels[config.status],
    confidence: config.confidence,
    evidenceSummaryJa: [config.note],
    evidence: [
      {
        type: config.evidenceType,
        label: record.source.documentType === "VID" ? "DVIDS / PURSUE official media" : "PURSUE official record",
        url: officialUrl,
        noteJa: config.note,
        matchedFields: ["assetFileName", "release", "agency", "documentType"],
        confidence: config.confidence,
      },
    ],
    attribution: [
      {
        source: attributionSource,
        sourceUrl: config.sourceUrl || officialUrl || officialWarPage,
        role: attributionRole,
        visible: "secondary",
      },
      {
        source: "ruppelt",
        role: "ruppelt_review",
        visible: "secondary",
      },
    ],
    checkedAt: "2026-05-25",
    checkedBy: "ruppelt",
    ruppeltVerified: false,
    manualReviewRequired: config.status === "unknown" || config.confidence === "low",
    reviewerNoteJa: config.note,
  };
}

function classify(record) {
  if (manualOverrides[record.source.id]) {
    return manualOverrides[record.source.id];
  }

  if (nasaAudioRecordIds.has(record.source.id)) {
    return {
      status: "partial",
      confidence: "medium",
      note: release02ResearchNotes.nasa_audio,
      evidenceType: "archive_match",
      source: "nasa",
    };
  }

  if (record.source.documentType === "VID") {
    if (isWeakDowVideo(record)) {
      return {
        status: "unknown",
        confidence: "low",
        note: release02ResearchNotes.weak_military_video,
        evidenceType: "metadata_match",
        source: "dvids",
      };
    }

    return {
      status: "first_time_public",
      confidence: "low",
      note: release02ResearchNotes.military_video,
      evidenceType: "official_source",
      source: "dvids",
    };
  }

  return {
    status: "unknown",
    confidence: "low",
    note: release02ResearchNotes.unknown,
    evidenceType: "manual_review",
    source: "ruppelt",
  };
}

for (const record of release02Records) {
  priorDisclosures[record.source.id] = makeDisclosure(record, classify(record));
}

await writeFile(priorDisclosuresPath, `${JSON.stringify(priorDisclosures, null, 2)}\n`, "utf8");
console.log(`Applied Release 02 prior-disclosure classifications to ${release02Records.length} records`);
