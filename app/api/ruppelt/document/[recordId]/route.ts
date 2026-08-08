import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

const rootDir = process.cwd();
const recordIdPattern = /^pursue-\d{4}$/;

type RouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

async function readJson(path: string) {
  return JSON.parse(await readFile(path, "utf8"));
}

const bundlePath = resolve(rootDir, "data/shared/pursue-document-bundles.json");
const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");

let cachedBundlesPromise: Promise<Record<string, BundleEntry>> | null = null;
let cachedRecordsPromise: Promise<{ records?: IndexRecord[] }> | null = null;

function loadBundles() {
  if (!cachedBundlesPromise) {
    cachedBundlesPromise = readJson(bundlePath).catch((error) => {
      cachedBundlesPromise = null;
      throw error;
    });
  }
  return cachedBundlesPromise;
}

function loadRecordsIndex() {
  if (!cachedRecordsPromise) {
    cachedRecordsPromise = readJson(recordsPath).catch((error) => {
      cachedRecordsPromise = null;
      throw error;
    });
  }
  return cachedRecordsPromise;
}

function toReadableJapaneseText(text: string) {
  const markerMatch = text.match(/(?:^|\n)\s*(?:（訳文）|（翻訳）|日本語訳[:：]?)\s*(?:\n|$)/);
  const sourceText = markerMatch ? text.slice((markerMatch.index || 0) + markerMatch[0].length) : text;
  const lines = sourceText.split(/\r?\n/);
  const kept: string[] = [];
  let pageMarker = "";
  let pageLines: string[] = [];

  const normalizePageMarker = (line: string) => {
    const pageMatch = line.match(/^(?:---\s*)?(?:PAGE|Page|\[Page)\s+(\d+)(?:\])?(?:\s*---)?$/i);
    return pageMatch ? `ページ ${pageMatch[1]}` : "";
  };

  const isMostlyNoise = (line: string) => {
    const compact = line.replace(/\s+/g, "");
    const japaneseChars = compact.match(/[\u3040-\u30ff\u3400-\u9fff]/g)?.length || 0;
    const lettersAndNumbers = compact.match(/[\p{Letter}\p{Number}]/gu)?.length || 0;
    const noiseChars = compact.length - lettersAndNumbers;
    const japaneseRatio = compact.length ? japaneseChars / compact.length : 0;

    return compact.length > 18 && (japaneseRatio < 0.08 || noiseChars / compact.length > 0.55);
  };

  const cleanReadableLine = (line: string) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return "";
    }

    if (/^(?:（訳文）|（翻訳）|日本語訳[:：]?)$/.test(trimmed)) {
      return "";
    }

    if (
      /^[-—\s]*分割\s*\d+\/\d+(?:\s*です[。.]?|\s*[-—]\s*翻訳(?:（全文）)?)?\s*[-—\s]*$/.test(
        trimmed,
      ) ||
      /^[-—\s]*日本語(?:翻訳|訳)\s*[（(][^）)]*(?:原文|ページ|OCR|黒塗り|ヘッダ|保持)[^）)]*[）)]\s*[:：]?\s*[-—\s]*$/.test(
        trimmed,
      ) ||
      /OCR本文.{0,80}(?:見当たりません|含まれていない|貼り付けてください|貼ってください|送ってください)/.test(
        trimmed,
      ) ||
      /受け取り次第.{0,80}翻訳/.test(trimmed)
    ) {
      return "";
    }

    if (/^https?:\/\/\S+$/i.test(trimmed)) {
      return "";
    }

    if (/^(?:SECRET|SECRE|NOFORN|CONFIDENTIAL|UNCLASSIFIED|OFFICIAL RECORD|FEDERAL BUREAU OF INVESTIGATION)\b/i.test(trimmed)) {
      return "";
    }

    const hasJapanese = /[\u3040-\u30ff\u3400-\u9fff]/.test(trimmed);

    if (!hasJapanese) {
      return "";
    }

    const structuralLine = /^(?:宛先|件名|要約|本文|日付|国|トピック|配布日|差出人|受取人|電話|FAX|ページ数|関連記録|キーワード|ステータス|コメント|同封物)[:：·.]/.test(trimmed);
    const compact = trimmed.replace(/\s+/g, "");
    const japaneseChars = compact.match(/[\u3040-\u30ff\u3400-\u9fff]/g)?.length || 0;
    const japaneseRatio = compact.length ? japaneseChars / compact.length : 0;

    if (structuralLine) {
      const [, label = "", value = ""] = trimmed.match(/^([^:：·.]+)[:：·.]\s*(.*)$/) || [];
      const valueCompact = value.replace(/\s+/g, "");
      const valueJapaneseChars = valueCompact.match(/[\u3040-\u30ff\u3400-\u9fff]/g)?.length || 0;

      if (label === "本文" && (!valueCompact || (valueCompact.length <= 8 && valueJapaneseChars === 0))) {
        return "";
      }
    }

    if (structuralLine && compact.length > 8 && japaneseRatio < 0.35) {
      const label = trimmed.match(/^([^:：·.]+)[:：·.]/)?.[1] || "";

      if (label === "本文") {
        return "";
      }

      return label ? `${label}: ${label === "宛先" || label === "受取人" ? "複数機関" : "原文参照"}` : "";
    }

    if (!structuralLine && isMostlyNoise(trimmed)) {
      return "";
    }

    return line.replace(/\s+$/g, "");
  };

  const flushPage = () => {
    const body = pageLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

    if (!body) {
      pageMarker = "";
      pageLines = [];
      return;
    }

    if (kept.length) {
      kept.push("");
    }

    if (pageMarker) {
      kept.push(pageMarker);
      kept.push("");
    }

    kept.push(body);
    pageMarker = "";
    pageLines = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const normalizedPageMarker = normalizePageMarker(trimmed);

    if (normalizedPageMarker) {
      flushPage();
      pageMarker = normalizedPageMarker;
      return;
    }

    const readableLine = cleanReadableLine(line);

    if (readableLine) {
      pageLines.push(readableLine);
      return;
    }

    if (!trimmed && pageLines.length && pageLines.at(-1) !== "") {
      pageLines.push("");
    }
  });

  flushPage();

  const readable = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return readable.length >= 120 ? readable : "";
}

type BundleEntry = {
  document?: { officialPdfUrl?: string; sourcePdfUrl?: string } | null;
  ocr?: { ocrTextEn?: string; source?: string } | null;
} | null;

type IndexRecord = {
  source?: {
    id?: string;
    downloadUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
  } | null;
};

function normalizeOfficialVideoUrl(url: string) {
  const trimmed = url.trim();
  const match = trimmed.match(/(?:dvidshub\.net\/video\/|\/UFO\/)(\d+)/i);

  return match ? `https://www.dvidshub.net/video/${match[1]}` : trimmed;
}

function resolveOfficialUrl(bundle: BundleEntry, record: IndexRecord | null) {
  return (
    bundle?.document?.officialPdfUrl ||
    bundle?.document?.sourcePdfUrl ||
    record?.source?.downloadUrl ||
    (record?.source?.videoUrl ? normalizeOfficialVideoUrl(record.source.videoUrl) : "") ||
    record?.source?.imageUrl ||
    ""
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { recordId } = await context.params;

  if (!recordIdPattern.test(recordId)) {
    return NextResponse.json({ error: "Invalid record id." }, { status: 400 });
  }

  const translationPath = resolve(rootDir, "data/shared/translations/ja", `${recordId}.json`);

  try {
    const [translation, bundles, index] = await Promise.all([
      readJson(translationPath).catch(() => null),
      loadBundles(),
      loadRecordsIndex(),
    ]);
    const bundle = bundles[recordId] || null;
    const record = index.records?.find((item: IndexRecord) => item?.source?.id === recordId) || null;
    const officialUrl = resolveOfficialUrl(bundle, record);

    return NextResponse.json({
      documentId: recordId,
      recordId,
      hasFullTextJa: Boolean(translation?.fullTextJa),
      hasOcrTextEn: Boolean(bundle?.ocr?.ocrTextEn?.trim()),
      officialUrl,
      summaryJa: translation?.summaryJa || "",
      summaryEn: translation?.summaryEn || "",
      fullTextJa: translation?.fullTextJa || "",
      readableFullTextJa: translation?.fullTextJa ? toReadableJapaneseText(translation.fullTextJa) : "",
      ocrTextEn: bundle?.ocr?.ocrTextEn || "",
      noteJa: translation?.noteJa || "",
      status: translation?.status || null,
      document: bundle?.document || null,
      ocrSource: bundle?.ocr?.source || null,
    });
  } catch (error) {
    console.error(`Failed to load Ruppelt document detail for ${recordId}:`, error);
    return NextResponse.json({ error: "Document detail could not be loaded." }, { status: 500 });
  }
}
