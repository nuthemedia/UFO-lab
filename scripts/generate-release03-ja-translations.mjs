import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  cleanPursueTranslationText,
  validateTranslatedChunk,
} from "./pursue-translation-quality.mjs";

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
const recordsArgIndex = process.argv.indexOf("--records");
const selectedRecordIds = new Set(
  recordsArgIndex >= 0 && process.argv[recordsArgIndex + 1]
    ? process.argv[recordsArgIndex + 1]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);
const releaseArgIndex = process.argv.indexOf("--release-id");
const selectedReleaseId =
  releaseArgIndex >= 0 && process.argv[releaseArgIndex + 1]
    ? process.argv[releaseArgIndex + 1]
    : "release_03";
const chunkCharsArgIndex = process.argv.indexOf("--chunk-chars");
const chunkChars =
  chunkCharsArgIndex >= 0 && process.argv[chunkCharsArgIndex + 1]
    ? Number.parseInt(process.argv[chunkCharsArgIndex + 1], 10)
    : 12000;

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

  const filtered = chunks.filter(Boolean);

  if (filtered.length > 1 && filtered.at(-1).length < 500) {
    filtered[filtered.length - 2] = `${filtered.at(-2)}\n\n${filtered.at(-1)}`;
    filtered.pop();
  }

  return filtered;
}

function isSeverelyCorruptedOcr(text) {
  const compact = text.replace(/\s/g, "");
  const alphanumericCharacters = (text.match(/[A-Za-z0-9]/g) || []).length;
  const wordCount = (text.match(/[A-Za-z]{3,}/g) || []).length;
  const alphanumericRatio = alphanumericCharacters / Math.max(compact.length, 1);

  return text.length >= 1000 && alphanumericRatio < 0.25 && wordCount < 100;
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
  if (isSeverelyCorruptedOcr(text)) {
    return "［OCR判読不能箇所。英語原文タブを参照］";
  }

  let lastValidation = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const retryInstruction =
      attempt === 1
        ? ""
        : "前回の出力は日本語量が不足しているか、翻訳以外の説明が含まれていました。英語本文を省略せず、翻訳本文だけを日本語で返してください。";
    const translated = await callOpenAi([
      {
        role: "system",
        content:
          "You translate U.S. government OCR text into natural Japanese for an archival browser. Return only the translated document body. Do not add an introduction, conclusion, translation heading, Markdown fence, explanation, refusal, or request for more input. Do not copy English prose unless it is a proper name, identifier, classification label, redaction marker, or uncertain OCR token that must be preserved. Preserve page markers, redaction markers, names, dates, file numbers, classification labels, and uncertain OCR artifacts. Do not add interpretation, commentary, or new facts.",
      },
      {
        role: "user",
        content: `次のOCR本文を省略せず日本語に全文翻訳してください。翻訳本文だけを返してください。分割 ${index + 1}/${total} です。${retryInstruction}\n\n${text}`,
      },
    ]);
    const validation = validateTranslatedChunk(text, translated);

    if (validation.valid) {
      return validation.text;
    }

    lastValidation = validation;
    console.warn(
      `Translation quality check failed for chunk ${index + 1}/${total} ` +
        `(attempt ${attempt}/3, coverage ${validation.coverage.toFixed(4)}).`,
    );
  }

  throw new Error(
    `Translation quality check failed after 3 attempts for chunk ${index + 1}/${total} ` +
      `(coverage ${(lastValidation?.coverage || 0).toFixed(4)}).`,
  );
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
const hasExplicitRecordSelection = Boolean(selectedRecordId || selectedRecordIds.size);
const selectedReleaseIds = new Set(
  recordsIndex.records
    .filter((record) => record.searchFacets?.releaseId === selectedReleaseId)
    .map((record) => record.source.id),
);
const targets = Object.entries(bundles)
  .filter(([recordId, bundle]) => {
    if (!hasExplicitRecordSelection && !selectedReleaseIds.has(recordId)) {
      return false;
    }

    if (selectedRecordId && selectedRecordId !== recordId) {
      return false;
    }

    if (selectedRecordIds.size && !selectedRecordIds.has(recordId)) {
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
const failures = [];

for (const target of limitedTargets) {
  try {
    const ocrTextEn = target.bundle.ocr.ocrTextEn;
    const chunks = chunkText(ocrTextEn, chunkChars);
    const translatedChunks = [];

    for (const [index, chunk] of chunks.entries()) {
      console.log(
        `Translating ${target.recordId} chunk ${index + 1}/${chunks.length} (${ocrTextEn.length} chars).`,
      );
      translatedChunks.push(await translateChunk(chunk, index, chunks.length));
    }

    const fullTextJa = cleanPursueTranslationText(translatedChunks.join("\n\n")).text;
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
    console.log(`Generated ${selectedReleaseId} Japanese translation for ${target.recordId} (${generated}/${limitedTargets.length}).`);
  } catch (error) {
    failures.push({ recordId: target.recordId, error: error.message });
    console.error(`Translation failed for ${target.recordId}; existing file was preserved:`, error);
  }
}

console.log(`Generated ${selectedReleaseId} Japanese translations for ${generated} document(s).`);

if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
}
