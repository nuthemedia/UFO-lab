import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = process.cwd();
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");
const bundlesPath = resolve(rootDir, "data/shared/pursue-document-bundles.json");
const documentsDir = resolve(rootDir, "data/shared/pursue-documents");
const translationsDir = resolve(rootDir, "data/shared/translations/ja");
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const openAiModel = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5-mini";
const force = process.argv.includes("--force");
const smallFirst = process.argv.includes("--small-first");
const includeLarge = process.argv.includes("--include-large");
const maxCharsArgIndex = process.argv.indexOf("--max-chars");
const maxChars =
  maxCharsArgIndex >= 0 && process.argv[maxCharsArgIndex + 1]
    ? Number.parseInt(process.argv[maxCharsArgIndex + 1], 10)
    : 250000;
const limitArgIndex = process.argv.indexOf("--limit");
const limit =
  limitArgIndex >= 0 && process.argv[limitArgIndex + 1]
    ? Number.parseInt(process.argv[limitArgIndex + 1], 10)
    : 0;
const recordArgIndex = process.argv.indexOf("--record");
const selectedRecordId =
  recordArgIndex >= 0 && process.argv[recordArgIndex + 1] ? process.argv[recordArgIndex + 1] : "";

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function chunkText(text, maxLength = 12000) {
  const chunks = [];
  let cursor = 0;

  while (cursor < text.length) {
    const next = Math.min(cursor + maxLength, text.length);
    const boundary = text.lastIndexOf("\n\n", next);
    const end = boundary > cursor + 3000 ? boundary : next;
    chunks.push(text.slice(cursor, end).trim());
    cursor = end;
  }

  return chunks.filter(Boolean);
}

async function callOpenAi(input) {
  let response;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openAiModel,
          input,
        }),
        signal: controller.signal,
      });
      break;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }

      console.warn(`OpenAI request failed, retrying (${attempt}/3): ${error.message}`);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 3000));
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI translation request failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const text =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .join("")
      .trim();

  if (!text) {
    throw new Error("OpenAI translation request returned empty text.");
  }

  return text;
}

async function translateChunk(text, index, total) {
  return callOpenAi([
    {
      role: "system",
      content:
        "You translate U.S. government OCR text into natural Japanese for an archival browser. Preserve page markers, redaction markers, names, dates, file numbers, classification labels, and uncertain OCR artifacts. Do not add interpretation, commentary, or new facts.",
    },
    {
      role: "user",
      content: `次のOCR本文を日本語に全文翻訳してください。分割 ${index + 1}/${total} です。\n\n${text}`,
    },
  ]);
}

async function summarizeDocument(ocrTextEn, fullTextJa) {
  const source = `${ocrTextEn.slice(0, 12000)}\n\n--- Japanese translation excerpt ---\n${fullTextJa.slice(0, 12000)}`;

  return callOpenAi([
    {
      role: "system",
      content:
        "You create concise archival summaries. Do not speculate. Return strict JSON with keys summaryJa and summaryEn.",
    },
    {
      role: "user",
      content:
        "次のPURSUE OCR本文について、日本語要約と英語要約を作成してください。JSONのみ返してください。\n\n" +
        source,
    },
  ]);
}

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is required.");
}

await mkdir(translationsDir, { recursive: true });
await mkdir(documentsDir, { recursive: true });

const recordsIndex = await readJson(recordsPath, { records: [] });
const bundles = await readJson(bundlesPath, {});
const release03Ids = new Set(
  recordsIndex.records
    .filter((record) => record.source.release === "6/12/26")
    .map((record) => record.source.id),
);
const targets = Object.entries(bundles)
  .filter(([recordId, bundle]) => {
    if (!release03Ids.has(recordId)) {
      return false;
    }

    if (selectedRecordId && selectedRecordId !== recordId) {
      return false;
    }

    if (!bundle?.ocr?.ocrTextEn?.trim()) {
      return false;
    }

    if (!includeLarge && bundle.ocr.ocrTextEn.length > maxChars) {
      return false;
    }

    const translationPath = resolve(translationsDir, `${recordId}.json`);
    return force || !existsSync(translationPath);
  })
  .map(([recordId, bundle]) => ({
    recordId,
    bundle,
    translationPath: resolve(translationsDir, `${recordId}.json`),
    documentPath: resolve(documentsDir, `${recordId}.json`),
  }));

if (smallFirst) {
  targets.sort((a, b) => a.bundle.ocr.ocrTextEn.length - b.bundle.ocr.ocrTextEn.length);
}

const limitedTargets = limit > 0 ? targets.slice(0, limit) : targets;
let generated = 0;

for (const target of limitedTargets) {
  const ocrTextEn = target.bundle.ocr.ocrTextEn;
  const chunks = chunkText(ocrTextEn);
  const translatedChunks = [];

  for (const [index, chunk] of chunks.entries()) {
    console.log(
      `Translating ${target.recordId} chunk ${index + 1}/${chunks.length} (${ocrTextEn.length} chars).`,
    );
    translatedChunks.push(await translateChunk(chunk, index, chunks.length));
  }

  const fullTextJa = translatedChunks.join("\n\n");
  let summaryJa = "未作成";
  let summaryEn = "Not created.";

  try {
    const summaryRaw = await summarizeDocument(ocrTextEn, fullTextJa);
    const summary = JSON.parse(summaryRaw);
    summaryJa = summary.summaryJa || summaryJa;
    summaryEn = summary.summaryEn || summaryEn;
  } catch {
    summaryJa = fullTextJa.slice(0, 260);
    summaryEn = ocrTextEn.slice(0, 260);
  }

  const translation = {
    documentId: target.recordId,
    recordId: target.recordId,
    fullTextJa,
    summaryJa,
    summaryEn,
    status: {
      translationJa: "machine_translation",
      summary: "summary_generated",
      humanReview: "unreviewed",
    },
    noteJa:
      "機械翻訳です。公式資料を正本とし、OCR誤読や翻訳誤りを含む可能性があります。",
  };
  const document = {
    ...(target.bundle.document || {}),
    documentStatus: {
      ...(target.bundle.document?.documentStatus || {}),
      ocr: "ocr_imported_unverified",
      translationJa: "machine_translation",
      summary: "summary_generated",
      humanReview: target.bundle.document?.documentStatus?.humanReview || "unreviewed",
    },
  };

  bundles[target.recordId] = {
    ...target.bundle,
    document,
  };

  await writeFile(target.translationPath, `${JSON.stringify(translation, null, 2)}\n`, "utf8");
  await writeFile(target.documentPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  await writeFile(bundlesPath, `${JSON.stringify(bundles, null, 2)}\n`, "utf8");
  generated += 1;
  console.log(`Generated Release 03 Japanese translation for ${target.recordId} (${generated}/${limitedTargets.length}).`);
}

console.log(`Generated Release 03 Japanese translations for ${generated} document(s).`);
