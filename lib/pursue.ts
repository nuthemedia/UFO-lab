export type PursueSourceRecord = {
  id: string;
  assetFileName: string;
  release: string;
  agency: string;
  incidentDate: string;
  incidentLocation: string;
  documentType: string;
  description: string;
  virin: string;
  downloadUrl: string;
  imageUrl: string;
  videoUrl: string;
};

export type PursueJaRecord = {
  assetFileNameJa: string;
  releaseJa: string;
  agencyJa: string;
  incidentLocationJa: string;
  documentTypeJa: string;
  descriptionJa: string;
};

export type PursueRecord = {
  source: PursueSourceRecord;
  ja: PursueJaRecord;
};

export type PursueIndex = {
  metadata: {
    appName: string;
    displayName: string;
    sourcePageUrl: string;
    csvUrl: string;
    fetchedAt: string | null;
    recordCount: number;
    untranslatedCount: number;
  };
  records: PursueRecord[];
};

export type PursueSort = "newest" | "oldest" | "title" | "agency";

const videoPortalPattern = /^https:\/\/www\.war\.gov\/Portals\/1\/Interactive\/2026\/UFO\/\d+\/?$/i;
const videoPortalIdPattern = /\/(\d+)\/?$/;

function compareStableStrings(a: string, b: string) {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

export function displayValue(primary: string, fallback: string) {
  return primary.trim() || fallback.trim() || "不明";
}

export function getTitle(record: PursueRecord) {
  return record.source.assetFileName || "不明";
}

export function getJapaneseTitle(record: PursueRecord) {
  return displayValue(record.ja.assetFileNameJa, record.source.assetFileName);
}

export function getRelease(record: PursueRecord) {
  return displayValue(record.ja.releaseJa, record.source.release);
}

export function getAgency(record: PursueRecord) {
  return displayValue(record.ja.agencyJa, record.source.agency);
}

export function getLocation(record: PursueRecord) {
  return displayValue(record.ja.incidentLocationJa, record.source.incidentLocation);
}

export function getDocumentType(record: PursueRecord) {
  return displayValue(record.ja.documentTypeJa, record.source.documentType);
}

export function getDescription(record: PursueRecord) {
  return displayValue(record.ja.descriptionJa, record.source.description);
}

export function getEnglishDescription(record: PursueRecord) {
  return record.source.description || "不明";
}

export function getDescriptionByLanguage(record: PursueRecord, language: "ja" | "en") {
  return language === "ja" ? getDescription(record) : getEnglishDescription(record);
}

export function getTitleByLanguage(record: PursueRecord, language: "ja" | "en") {
  return language === "ja" ? getJapaneseTitle(record) : getTitle(record);
}

export function getSearchText(record: PursueRecord) {
  return [
    record.source.assetFileName,
    record.source.release,
    record.source.agency,
    record.source.incidentDate,
    record.source.incidentLocation,
    record.source.documentType,
    record.source.description,
    record.source.virin,
    record.ja.assetFileNameJa,
    record.ja.releaseJa,
    record.ja.agencyJa,
    record.ja.incidentLocationJa,
    record.ja.documentTypeJa,
    record.ja.descriptionJa,
  ]
    .join(" ")
    .toLowerCase();
}

export function getVideoUrl(record: PursueRecord) {
  const url = record.source.videoUrl.trim();
  const dvidsId = getDvidsVideoId(record);

  if (!url) {
    return "";
  }

  if (dvidsId) {
    return `https://www.dvidshub.net/video/${dvidsId}`;
  }

  return url;
}

export function getDvidsVideoId(record: PursueRecord) {
  const url = record.source.videoUrl.trim();

  if (!url) {
    return "";
  }

  if (/^\d+$/.test(url)) {
    return url;
  }

  if (!videoPortalPattern.test(url)) {
    return "";
  }

  return url.match(videoPortalIdPattern)?.[1] || "";
}

export function getVideoEmbedUrl(record: PursueRecord) {
  const dvidsId = getDvidsVideoId(record);
  return dvidsId ? `https://www.dvidshub.net/video/embed/${dvidsId}` : "";
}

export function uniqueValues(records: PursueRecord[], getter: (record: PursueRecord) => string) {
  return Array.from(new Set(records.map(getter).filter(Boolean))).sort(compareStableStrings);
}

export function parseDate(value: string) {
  const normalized = value.trim();
  const slashDate = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);

  if (slashDate) {
    const month = Number(slashDate[1]);
    const day = Number(slashDate[2]);
    const rawYear = Number(slashDate[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return Date.UTC(year, month - 1, day);
    }
  }

  const isoDate = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoDate) {
    return Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }

  return 0;
}

export function sortRecords(records: PursueRecord[], sort: PursueSort) {
  return [...records].sort((a, b) => {
    if (sort === "oldest") {
      return parseDate(a.source.incidentDate) - parseDate(b.source.incidentDate);
    }

    if (sort === "title") {
      return compareStableStrings(getTitle(a), getTitle(b));
    }

    if (sort === "agency") {
      return compareStableStrings(getAgency(a), getAgency(b));
    }

    return parseDate(b.source.incidentDate) - parseDate(a.source.incidentDate);
  });
}
