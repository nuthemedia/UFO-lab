import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  cleanPursueTranslationText,
  getJapaneseCoverage,
  isGenerationFailureText,
  minimumJapaneseCoverage,
} from "./pursue-translation-quality.mjs";

const rootDir = process.cwd();
const translationsDir = resolve(rootDir, "data/shared/translations/ja");
const bundlesPath = resolve(rootDir, "data/shared/pursue-document-bundles.json");
const reportPath = resolve(rootDir, "data/pursue/pursue-translation-quality-audit.json");
const apply = process.argv.includes("--apply");

function applyKnownTranslationCorrections(recordId, value) {
  if (recordId !== "pursue-0373") {
    return value;
  }

  return value
    .replace(" FEDERAL BUREAU OF INVESTIGATION", "連邦捜査局")
    .replace(" Date of entry ~", "記録日：～")
    .replace("On - 2026、", "2026年-、")
    .replace(
      "Un ited States .\nInvestigation on\n\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ Date drafted ~\nby\nThis document contains neither recommendations nor conclusions ofthe FBI. It is the property ofthe FBI and is loaned to your agency; it and its contents are not\nto be distributed outside your agency.",
      "米国\n捜査日：～\n\n作成日：～\n作成者：～\nこの文書にはFBIの勧告または結論は含まれない。本書はFBIの所有物であり、関係機関に貸与されるものである。本書およびその内容を関係機関の外部へ配布してはならない。",
    )
    .replace(
      "Continuation ofFD-302 of _ _ _ _ _ _ _ , On ~ ,Page 2 of 3",
      "FD-302の続き：________、日付：～、全3ページ中2ページ",
    )
    .replace(
      "The low- e l evation lig h ts described\nwould have been backdro pped by the mountains and be low the r e l ative hori z o n\nline I\n\nh e o bserved was no t a UAS that he famil iar with . - noted no exhaust o r\nta il when these ob j ects moved , and they exhibited no a udibl e sound\nsignature . - attempted to observed t h e o bjects through t h ermal o ptics,\nbut was unsuccessful .",
      "説明された低高度の光は山々を背景とし、相対的な地平線より下に見えたはずである。-は、観察したものは自身が知る無人航空システム（UAS）ではなかったと述べた。物体が移動した際に排気や尾は見られず、聞き取れる音も発していなかった。-は熱光学機器で物体を観察しようとしたが、確認できなかった。",
    )
    .replace(
      "- 彼は自身の in f o rmati on を提供し、捜査官からの open t o furt h er contact を受けることに前向きだった。",
      "-は自身の連絡先情報を提供し、捜査官から今後連絡を受けることに同意した。",
    );
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function createSnapshot({ cleanFiles = false } = {}) {
  const bundles = await readJson(bundlesPath, {});
  const files = (await readdir(translationsDir)).filter((fileName) => /^pursue-\d{4}\.json$/.test(fileName));
  const records = [];

  for (const fileName of files) {
    const path = resolve(translationsDir, fileName);
    const translation = await readJson(path, null);

    if (!translation) {
      continue;
    }

    const recordId = fileName.replace(/\.json$/, "");
    const originalText = translation.fullTextJa || "";
    const correctedText = applyKnownTranslationCorrections(recordId, originalText);
    const cleaned = cleanPursueTranslationText(correctedText);
    const ocrTextEn = bundles[recordId]?.ocr?.ocrTextEn || "";
    const quality = getJapaneseCoverage(cleaned.text, ocrTextEn);
    const failureDetected = isGenerationFailureText(originalText);
    const lowCoverage = quality.sourceLatinCharacters >= 300 && quality.coverage < minimumJapaneseCoverage;

    if (cleanFiles && cleaned.text !== originalText) {
      await writeFile(
        path,
        `${JSON.stringify({ ...translation, fullTextJa: cleaned.text }, null, 2)}\n`,
        "utf8",
      );
    }

    records.push({
      recordId,
      japaneseCharacters: quality.japaneseCharacters,
      sourceLatinCharacters: quality.sourceLatinCharacters,
      japaneseCoverage: Number(quality.coverage.toFixed(4)),
      lowCoverage,
      failureDetected,
      removedLines: cleaned.removedLines,
      normalizedLines: cleaned.normalizedLines,
      needsRetranslation: lowCoverage || failureDetected,
    });
  }

  return {
    translationCount: records.length,
    lowCoverageCount: records.filter((record) => record.lowCoverage).length,
    failureCount: records.filter((record) => record.failureDetected).length,
    noiseFileCount: records.filter(
      (record) => record.removedLines.length || record.normalizedLines.length,
    ).length,
    retranslationTargets: records
      .filter((record) => record.needsRetranslation)
      .map((record) => record.recordId),
    records,
  };
}

const existingReport = await readJson(reportPath, null);
const before = await createSnapshot({ cleanFiles: apply });
const current = apply ? await createSnapshot() : before;
const report = {
  generatedAt: new Date().toISOString(),
  minimumJapaneseCoverage,
  baseline: existingReport?.baseline || before,
  current,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      apply,
      translationCount: current.translationCount,
      lowCoverageCount: current.lowCoverageCount,
      failureCount: current.failureCount,
      noiseFileCount: current.noiseFileCount,
      retranslationTargets: current.retranslationTargets,
    },
    null,
    2,
  ),
);
