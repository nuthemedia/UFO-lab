export const minimumJapaneseCoverage = 0.08;

const generationFailurePatterns = [
  /OCR本文.{0,80}(?:見当たりません|含まれていない|貼り付けてください|貼ってください|送ってください)/,
  /翻訳(?:する|したい).{0,80}(?:テキスト|本文).{0,80}(?:貼り付け|送って)/,
  /受け取り次第.{0,80}翻訳/,
  /次のOCR本文を日本語に全文翻訳します/,
  /分割\s*\d+\/\d+.{0,80}(?:貼り付け|送って)/,
];

const standaloneTranslationHeaderPatterns = [
  /^[-—\s]*分割\s*\d+\/\d+(?:\s*です[。.]?|\s*[-—]\s*翻訳(?:（全文）)?)?\s*[-—\s]*$/,
  /^[-—\s]*[（(]?\s*(?:以下[は、,\s]*|ここから下[をは、,\s]*|続きの?|上記(?:の|英文|英語|原文|本文|文書|欄|ブラケット内|独文|手紙本文|通達本文)?(?:部分)?の?\s*)?(?:日本語翻訳|日本語訳|翻訳文|翻訳)(?:[・\s]?続き)?\s*[）)]?\s*[:：]?\s*[-—\s]*$/,
  /^[-—\s]*日本語(?:翻訳|訳)\s*[（(][^）)]*(?:原文|ページ|OCR|黒塗り|ヘッダ|保持)[^）)]*[）)]\s*[:：]?\s*[-—\s]*$/,
  /^[（(](?:以下|上記)[^）)]*日本語訳[^）)]*[）)]$/,
  /^動作に関する日本語訳[（(][^）)]*[）)]$/,
];

const genericProcessNotePatterns = [
  /^[（(]?(?:注[:：]?\s*)?(?:以下|上記|このページ|ページ区切り|ヘッダ部分|図内|レイアウト).{0,160}(?:日本語訳|翻訳).{0,160}(?:原文どおり|保持|保存|維持).*[）)]?$/,
  /^[（(]?(?:以下は)?提示されたOCR本文の翻訳です[。,.]?.*[）)]?$/,
  /^原文のページ区切りを保持[。.]$/,
];

export function countJapaneseCharacters(value) {
  return (String(value || "").match(/[\u3040-\u30ff\u3400-\u9fff]/g) || []).length;
}

export function countLatinCharacters(value) {
  return (String(value || "").match(/[A-Za-z]/g) || []).length;
}

export function getJapaneseCoverage(fullTextJa, ocrTextEn) {
  const sourceLatinCharacters = countLatinCharacters(ocrTextEn);
  const japaneseCharacters = countJapaneseCharacters(fullTextJa);

  return {
    japaneseCharacters,
    sourceLatinCharacters,
    coverage:
      sourceLatinCharacters > 0 ? japaneseCharacters / sourceLatinCharacters : japaneseCharacters > 0 ? 1 : 0,
  };
}

export function isGenerationFailureText(value) {
  return generationFailurePatterns.some((pattern) => pattern.test(String(value || "")));
}

function normalizePageTranslationHeader(line) {
  const trimmed = line.trim();
  const pageMatch = trimmed.match(
    /^(?:---\s*)?(?:PAGE|Page|\[Page)\s+(\d+)(?:\])?\s*[（(]日本語訳[）)]\s*(?:---)?$/,
  );

  if (pageMatch) {
    return `--- PAGE ${pageMatch[1]} ---`;
  }

  const pageTranslationMatch = trimmed.match(/^\[Page\s+(\d+)\]\s*の日本語訳[:：]?$/i);
  return pageTranslationMatch ? `--- PAGE ${pageTranslationMatch[1]} ---` : null;
}

export function isTranslationProcessNoiseLine(line) {
  const trimmed = String(line || "").trim();

  if (!trimmed) {
    return false;
  }

  return (
    isGenerationFailureText(trimmed) ||
    standaloneTranslationHeaderPatterns.some((pattern) => pattern.test(trimmed)) ||
    genericProcessNotePatterns.some((pattern) => pattern.test(trimmed))
  );
}

export function cleanPursueTranslationText(value) {
  const removedLines = [];
  const normalizedLines = [];
  const output = [];

  for (const line of String(value || "").split(/\r?\n/)) {
    const normalizedPageHeader = normalizePageTranslationHeader(line);

    if (normalizedPageHeader) {
      if (normalizedPageHeader !== line.trim()) {
        normalizedLines.push({ from: line.trim(), to: normalizedPageHeader });
      }
      output.push(normalizedPageHeader);
      continue;
    }

    if (isTranslationProcessNoiseLine(line)) {
      removedLines.push(line.trim());
      continue;
    }

    output.push(line.replace(/\s+$/g, ""));
  }

  return {
    text: output.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
    removedLines,
    normalizedLines,
  };
}

export function validateTranslatedChunk(sourceText, translatedText) {
  const cleaned = cleanPursueTranslationText(translatedText);
  const quality = getJapaneseCoverage(cleaned.text, sourceText);
  const hasEnoughSourceText = quality.sourceLatinCharacters >= 300;
  const validCoverage = !hasEnoughSourceText || quality.coverage >= minimumJapaneseCoverage;

  return {
    ...cleaned,
    ...quality,
    valid: Boolean(cleaned.text) && validCoverage && !isGenerationFailureText(cleaned.text),
  };
}
