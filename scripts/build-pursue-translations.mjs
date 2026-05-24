import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const translationsPath = resolve(rootDir, "data/pursue/pursue-translations.ja.json");

const records = JSON.parse(await readFile(recordsPath, "utf8"));

const titleCache = new Map();
const descriptionCache = new Map();

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
  } catch (error) {
    console.warn(`Translation fallback for: ${normalized}`);
    cache.set(normalized, normalized);
    return normalized;
  }
}

const output = {};
let processed = 0;

for (const record of records.records) {
  const assetFileNameJa = await getTranslation(titleCache, record.source.assetFileName);
  const descriptionJa = await getTranslation(descriptionCache, record.source.description);

  output[record.source.id] = {
    assetFileNameJa,
    releaseJa: "",
    agencyJa: "",
    incidentLocationJa: "",
    documentTypeJa: "",
    descriptionJa,
  };

  processed += 1;
  if (processed % 10 === 0) {
    console.log(`Translated ${processed}/${records.records.length}`);
  }
}

await writeFile(translationsPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${translationsPath}`);
