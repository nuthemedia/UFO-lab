import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const translationsPath = resolve(rootDir, "data/pursue/pursue-translations.ja.json");

const raw = JSON.parse(await readFile(recordsPath, "utf8"));
const translations = JSON.parse(await readFile(translationsPath, "utf8"));

const mergedRecords = raw.records.map((record) => {
  const translation = translations[record.source.id] || {};

  return {
    ...record,
    ja: {
      assetFileNameJa: translation.assetFileNameJa || "",
      releaseJa: translation.releaseJa || "",
      agencyJa: translation.agencyJa || "",
      incidentLocationJa: translation.incidentLocationJa || "",
      documentTypeJa: translation.documentTypeJa || "",
      descriptionJa: translation.descriptionJa || "",
    },
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
