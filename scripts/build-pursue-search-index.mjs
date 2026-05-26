import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const documentsDir = resolve(rootDir, "data/shared/pursue-documents");
const ocrDir = resolve(rootDir, "data/shared/ocr");
const translationsDir = resolve(rootDir, "data/shared/translations/ja");
const searchDir = resolve(rootDir, "data/shared/search");
const bundlesPath = resolve(rootDir, "data/shared/pursue-document-bundles.json");

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function readJsonDir(dir) {
  const entries = new Map();
  const files = await readdir(dir).catch(() => []);

  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }

    const data = await readJsonIfExists(resolve(dir, file));
    if (data?.documentId) {
      entries.set(data.documentId, data);
    }
  }

  return entries;
}

function compactText(values) {
  return values.filter(Boolean).join(" ").replace(/\s+/g, " ").trim().toLowerCase();
}

const index = JSON.parse(await readFile(recordsPath, "utf8"));
const documents = await readJsonDir(documentsDir);
const ocrDocuments = await readJsonDir(ocrDir);
const translations = await readJsonDir(translationsDir);
const bundles = {};
const descriptionEntries = [];
const fulltextEntries = [];

for (const record of index.records) {
  const documentId = record.documentId || record.source.id;
  const document = documents.get(documentId);
  const ocr = ocrDocuments.get(documentId);
  const translation = translations.get(documentId);
  const disclosure = record.priorDisclosure;

  if (document || ocr || translation) {
    bundles[documentId] = {
      ...(document ? { document } : {}),
      ...(ocr ? { ocr } : {}),
      ...(translation ? { translationJa: translation } : {}),
    };
  }

  descriptionEntries.push({
    documentId,
    recordId: record.source.id,
    searchText: compactText([
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
      disclosure?.labelJa,
      disclosure?.reviewerNoteJa,
      ...(disclosure?.evidenceSummaryJa || []),
      ...(disclosure?.evidence || []).map((item) => `${item.label} ${item.noteJa}`),
      translation?.summaryJa,
      translation?.summaryEn,
    ]),
  });

  if (ocr?.ocrTextEn || translation?.fullTextJa) {
    fulltextEntries.push({
      documentId,
      recordId: record.source.id,
      searchText: compactText([ocr?.ocrTextEn, translation?.fullTextJa]),
    });
  }
}

await mkdir(searchDir, { recursive: true });
await writeFile(resolve(searchDir, "description-index.json"), `${JSON.stringify(descriptionEntries, null, 2)}\n`, "utf8");
await writeFile(resolve(searchDir, "fulltext-index.json"), `${JSON.stringify(fulltextEntries, null, 2)}\n`, "utf8");
await writeFile(bundlesPath, `${JSON.stringify(bundles, null, 2)}\n`, "utf8");

console.log(`Wrote ${descriptionEntries.length} description search entries.`);
console.log(`Wrote ${fulltextEntries.length} fulltext search entries.`);
console.log(`Wrote ${Object.keys(bundles).length} shared document bundle(s).`);
