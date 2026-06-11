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

function toReadableJapaneseText(text: string) {
  const lines = text.split(/\r?\n/);
  const kept: string[] = [];
  let pageMarker = "";
  let pageLines: string[] = [];

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
    const isPageMarker = /^\[Page\s+\d+\]/i.test(trimmed);
    const hasJapanese = /[\u3040-\u30ff\u3400-\u9fff]/.test(trimmed);

    if (isPageMarker) {
      flushPage();
      pageMarker = trimmed.replace(/\s+\[\[.*?\]\]/g, "");
      return;
    }

    if (hasJapanese) {
      pageLines.push(line.replace(/\s+$/g, ""));
      return;
    }

    if (!trimmed && pageLines.length && pageLines.at(-1) !== "") {
      pageLines.push("");
    }
  });

  flushPage();

  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
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

function resolveOfficialUrl(bundle: BundleEntry, record: IndexRecord | null) {
  return (
    bundle?.document?.officialPdfUrl ||
    bundle?.document?.sourcePdfUrl ||
    record?.source?.downloadUrl ||
    record?.source?.videoUrl ||
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
  const bundlePath = resolve(rootDir, "data/shared/pursue-document-bundles.json");
  const recordsPath = resolve(rootDir, "data/pursue/pursue-records.json");

  try {
    const [translation, bundles, index] = await Promise.all([
      readJson(translationPath).catch(() => null),
      readJson(bundlePath),
      readJson(recordsPath),
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
