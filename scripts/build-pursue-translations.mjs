import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const translationsPath = resolve(rootDir, "data/pursue/pursue-translations.ja.json");
const releaseArgIndex = process.argv.indexOf("--release-id");
const selectedReleaseId =
  releaseArgIndex >= 0 && process.argv[releaseArgIndex + 1]
    ? process.argv[releaseArgIndex + 1]
    : "";

const records = JSON.parse(await readFile(recordsPath, "utf8"));
const existingTranslations = await readFile(translationsPath, "utf8")
  .then((content) => JSON.parse(content))
  .catch(() => ({}));

const titleCache = new Map();
const descriptionCache = new Map();
const locationCache = new Map();
const agencyCache = new Map();

const releaseLabels = {
  release_01: "2026年5月8日（Release 01）",
  release_02: "2026年5月22日（Release 02）",
  release_03: "2026年6月12日（Release 03）",
  release_04: "2026年7月10日（Release 04）",
  release_05: "2026年8月7日（Release 05）",
};
const agencyLabels = {
  "Department of War": "米国戦争省",
  "Department of State": "米国国務省",
  "Executive Office of the President": "大統領行政府",
  FBI: "FBI",
  CIA: "CIA",
  NASA: "NASA",
};
const typeLabels = {
  PDF: "PDF",
  IMG: "画像",
  VID: "動画",
  AUD: "音声",
};

function getReleaseId(record) {
  const release = String(record.source.release || "").toLowerCase();

  if (release.includes("8/7") || release.includes("august 7")) return "release_05";
  if (release.includes("7/10") || release.includes("july 10")) return "release_04";
  if (release.includes("6/12") || release.includes("june 12")) return "release_03";
  if (release.includes("5/22") || release.includes("may 22")) return "release_02";
  return "release_01";
}

async function translateText(text) {
  const normalized = text.trim();
  if (!normalized) {
    return "";
  }

  const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
  endpoint.searchParams.set("client", "gtx");
  endpoint.searchParams.set("sl", "en");
  endpoint.searchParams.set("tl", "ja");
  endpoint.searchParams.set("dt", "t");
  endpoint.searchParams.set("q", normalized);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Translation request failed with ${response.status}`);
  }

  const payload = await response.json();
  const segments = Array.isArray(payload?.[0]) ? payload[0] : [];
  const translated = segments
    .map((segment) => (Array.isArray(segment) ? segment[0] : ""))
    .filter(Boolean)
    .join("");

  return translated || normalized;
}

async function getTranslation(cache, text) {
  const normalized = text.trim();
  if (!normalized) {
    return "";
  }

  if (cache.has(normalized)) {
    return cache.get(normalized);
  }

  try {
    const translated = await translateText(normalized);
    cache.set(normalized, translated);
    return translated;
  } catch {
    console.warn(`Translation fallback for: ${normalized}`);
    cache.set(normalized, normalized);
    return normalized;
  }
}

const output = {};
let processed = 0;

for (const record of records.records) {
  const existing = existingTranslations[record.source.id] || {};
  const releaseId = getReleaseId(record);

  if (selectedReleaseId && releaseId !== selectedReleaseId) {
    output[record.source.id] = existing;
    continue;
  }

  const assetFileNameJa =
    existing.assetFileNameJa || (await getTranslation(titleCache, record.source.assetFileName));
  const descriptionJa =
    existing.descriptionJa || (await getTranslation(descriptionCache, record.source.description));
  const incidentLocationJa =
    existing.incidentLocationJa ||
    (record.source.incidentLocation === "N/A"
      ? "該当なし"
      : await getTranslation(locationCache, record.source.incidentLocation));

  output[record.source.id] = {
    assetFileNameJa,
    releaseJa: existing.releaseJa || releaseLabels[releaseId] || "",
    agencyJa:
      existing.agencyJa ||
      agencyLabels[record.source.agency] ||
      (await getTranslation(agencyCache, record.source.agency)),
    incidentLocationJa,
    documentTypeJa: existing.documentTypeJa || typeLabels[record.source.documentType] || "",
    descriptionJa,
  };

  processed += 1;
  if (processed % 10 === 0) {
    console.log(`Translated ${processed}/${records.records.length}`);
  }
}

await writeFile(translationsPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${translationsPath}`);
