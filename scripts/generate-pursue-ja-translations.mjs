import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(process.cwd());
const ocrDir = resolve(rootDir, "data/shared/ocr");
const documentsDir = resolve(rootDir, "data/shared/pursue-documents");
const translationsDir = resolve(rootDir, "data/shared/translations/ja");
const allMode = process.argv.includes("--all");
const force = process.argv.includes("--force");
const smallFirst = process.argv.includes("--small-first");
const limitArgIndex = process.argv.indexOf("--limit");
const limit =
  limitArgIndex >= 0 && process.argv[limitArgIndex + 1]
    ? Number.parseInt(process.argv[limitArgIndex + 1], 10)
    : 0;
const recordArgIndex = process.argv.indexOf("--record");
const selectedRecordId =
  recordArgIndex >= 0 && process.argv[recordArgIndex + 1] ? process.argv[recordArgIndex + 1] : "";
const openAiApiKey = process.env.OPENAI_API_KEY || "";
const openAiModel = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5-mini";

const samples = {
  "pursue-0020": {
    summaryJa:
      "Gemini 7の交信記録。乗員が10時方向高所の「bogey」と、多数の小さな粒子、ブースターを視認したと報告している。",
    summaryEn:
      "Gemini 7 air-to-ground transcript in which the crew reports a bogey high at ten o'clock, many small particles, and the booster in sight.",
    fullTextJa:
      "P.A.O.リリース用のGemini 7/6飛行解説テープ。管制センターのマスターテープから複製され、粒子だけでなく未確認物体とブースターへの言及を含む会話として再生される。HoustonがGemini 7に通信状態を確認し、Bormanは「10時方向高所にbogeyがある」と報告する。Houstonは、それがブースターなのか自然現象なのかを確認しようとするが、Bormanは「ここにデブリがあり、これは実際の視認だ」と述べる。距離や大きさを尋ねられると、Bormanはブースターも視認しており、左側を数百個の小さな粒子が3、4マイルほど外側で通過しているように見えると説明する。粒子は車両の進路に対して90度の経路のように見え、やがて通過して極軌道に入っていくように見えたとされる。Lovellは自分の側にブースターがあり、黒い背景に太陽光を受けた明るい物体として見え、その周囲に非常に多くの粒子があると述べる。Houstonは方向を尋ね、Lovellは2時方向前方でゆっくり回転していると答える。最後にGemini Controlは、この会話中の第三の未確認物体への言及は「bogey」であり、飛行4時間24分時点の交信だったと説明する。",
  },
  "pursue-0140": {
    summaryJa:
      "Apollo 17技術デブリーフィングの抜粋。火球、回収時の視認、暗順応時の光の閃光について乗員が述べている。",
    summaryEn:
      "Apollo 17 technical crew debriefing excerpt discussing a fireball-like view, recovery observations, and light flashes during dark-adapted periods.",
    fullTextJa:
      "NASA有人宇宙船センターのApollo 17技術クルー・デブリーフィング。1973年1月4日、訓練オフィスおよびクルー訓練・シミュレーション部門によって作成された文書で、公開から90日後に自動的に機密解除される旨と、FOIAに基づく公開制限の可能性が記されている。抜粋部分では、Evansが火球の明るさが下がった後、ランデブー窓から見返すと、中央に明るい点があるトンネルのようなものが見え、その奥に火球が見えたと述べる。Cernanは、着陸または回収時の唯一の珍しい視認として、CMPが窓の外を見て航空母艦の上部構造物を見つけ、「tin canが一緒にいる」と言った場面を挙げる。Evansは窓が曇っていたと補足する。Schmittは地球帰還中、地球は小さな三日月状で広範な気象観測は現実的ではなかったと述べる。また、暗順応している間は飛行中ほぼ継続的に光の閃光があり、月面上の閃光だと思ったものも一度あったと説明する。ALFMED実験で目隠しをしていた時間帯には見える閃光がなく、その夜寝る前には再び光の閃光が見えるようになったため、その前後の短い間だけ自分や他の2人には閃光が見えなかったようだと述べている。",
  },
  "pursue-0155": {
    summaryJa:
      "2023年9月のFBI FD-302聞き取り記録。試験場へ向かう途中、白く明るい光が地平線上に見え、短時間で消えたという証言を記録している。",
    summaryEn:
      "FBI FD-302 interview record from September 2023 describing a bright white light seen near the horizon while traveling to a test site.",
    fullTextJa:
      "FBIのFD-302聞き取り記録。2023年10月の記入で、特別捜査官が関係者に聞き取りを行った。聞き取り対象者は、2023年9月の午前9時ごろ、LiDAR試験のデータ取得のため試験場へ向かって東へ走行していたと説明する。複数の車両が隊列で走行しており、GMC AT4やスプリンターバンが後続していた。車両がいくつかのゲートを通過した際、証言者は地平線上に明るい光を見た。光は空中で静止していた後、右へ動き始め、消えた。車両のフロントガラス右上越しに見え、色は明るい白で、消えるまで約10秒間視認できた。事象中、光の大きさは変わらず、距離は10から20マイルほど離れているように感じられた。車両への干渉は認識されなかった。証言者は同乗者に光を指し示したが、相手は違う方向を見ていたため確認できなかった。後に最初の試験場へ到着した際、別の関係者もそれを見たと述べたため、同乗者はその光に対して無関心ではなくなった、という内容である。",
  },
  "pursue-0156": {
    summaryJa:
      "同じ2023年9月事案のFD-302続き。物体の大きさや光度が一定で、車両干渉は見られず、目撃後に心理的影響を受けた証言が記録されている。",
    summaryEn:
      "Continuation of the September 2023 FD-302 noting constant apparent size and brightness, no vehicle interference, and aftereffects reported by a witness.",
    fullTextJa:
      "FBI FD-302続きの2ページ目。証言者は、観測していた間、物体の見かけの大きさと光の強さは同じままだったと述べる。小さな橋を越えてゲートへ向かっている時点では物体を見ておらず、ゲートを通過する頃に気づいた。車両への干渉は認識されなかった。別の証言者は、当初その物体を見たとき、実施予定だったドローン試験のため空域が制限されていたので不快に感じたと述べる。2台目の車両にいた人物は、別の関係者にも物体を見せようとしたが成功しなかった。その夜、嵐が通過し、証言者のホテルの部屋ではテレビが映らなくなった。目撃後も動揺していたため、ホテル内のテレビがすべて映らないのか、自室だけなのかを確かめに階下へ降りた。証言者は奇妙な夢を見て、物体を見た後の最初の2晩は睡眠に問題があったと記録されている。",
  },
  "pursue-0157": {
    summaryJa:
      "2023年9月事案のFD-302続き。物体の光度と大きさ、ゲート付近での視認、車両干渉の有無、目撃後の心理的反応が記録されている。",
    summaryEn:
      "FD-302 continuation for the September 2023 sighting, recording witness statements about the object's brightness, size, vehicle effects, and aftereffects.",
    fullTextJa:
      "FBI FD-302aの継続ページ。2023年9月のUAP事案について、2ページ目として記録されている。証言では、観測中、物体は同じ大きさと同じ光度を保っていた。証言者は、小さな橋を越えてゲートへ向かうまでは物体を見ておらず、ゲートを通過する時点で視認した。車両への干渉は認識されなかった。別の証言者は、最初に物体を見た際、これから行うドローン試験のため空域が制限されていたのでいらだちを覚えたと説明する。2台目の車両にいた人物が他の関係者に物体を見せようとしたが、うまくいかなかった。その夜、嵐が来てホテルの部屋のテレビが映らなくなり、証言者はまだ動揺していたため、ホテル全体のテレビが映らないのか自室だけなのかを確認しに下へ降りた。証言者は奇妙な夢を見て、目撃後の最初の2晩は眠りにくかったと述べている。",
  },
};

await mkdir(translationsDir, { recursive: true });

const files = await readdir(ocrDir).catch(() => []);
let generated = 0;

async function readJsonIfExists(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
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
      });
      break;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }

      console.warn(`OpenAI request failed, retrying (${attempt}/3): ${error.message}`);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 3000));
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

async function generateAllTranslations() {
  if (!openAiApiKey) {
    throw new Error(
      "OPENAI_API_KEY is required for --all. Set OPENAI_API_KEY and rerun: node scripts/generate-pursue-ja-translations.mjs --all",
    );
  }

  const targets = [];

  for (const file of files) {
    if (!file.endsWith(".json")) {
      continue;
    }

    const ocr = await readJsonIfExists(resolve(ocrDir, file));

    if (!ocr?.ocrTextEn?.trim()) {
      continue;
    }

    if (selectedRecordId && ocr.recordId !== selectedRecordId && ocr.documentId !== selectedRecordId) {
      continue;
    }

    const translationPath = resolve(translationsDir, file);
    const existingTranslation = await readJsonIfExists(translationPath);

    if (existingTranslation?.fullTextJa && !force) {
      continue;
    }

    targets.push({ file, ocr, translationPath });
  }

  if (smallFirst) {
    targets.sort((a, b) => a.ocr.ocrTextEn.length - b.ocr.ocrTextEn.length);
  }

  const limitedTargets = limit > 0 ? targets.slice(0, limit) : targets;

  for (const target of limitedTargets) {
    const chunks = chunkText(target.ocr.ocrTextEn);
    const translatedChunks = [];

    for (const [index, chunk] of chunks.entries()) {
      console.log(
        `Translating ${target.ocr.recordId} chunk ${index + 1}/${chunks.length} (${target.ocr.ocrTextEn.length} chars).`,
      );
      translatedChunks.push(await translateChunk(chunk, index, chunks.length));
    }

    const fullTextJa = translatedChunks.join("\n\n");
    let summaryJa = "未作成";
    let summaryEn = "Not created.";

    try {
      const summaryRaw = await summarizeDocument(target.ocr.ocrTextEn, fullTextJa);
      const summary = JSON.parse(summaryRaw);
      summaryJa = summary.summaryJa || summaryJa;
      summaryEn = summary.summaryEn || summaryEn;
    } catch {
      summaryJa = fullTextJa.slice(0, 260);
      summaryEn = target.ocr.ocrTextEn.slice(0, 260);
    }

    const documentPath = resolve(documentsDir, target.file);
    const document = await readJsonIfExists(documentPath);
    const translation = {
      documentId: target.ocr.documentId,
      recordId: target.ocr.recordId,
      fullTextJa,
      summaryJa,
      summaryEn,
      status: {
        translationJa: "machine_translation",
        summary: "summary_generated",
        humanReview: "unreviewed",
      },
      noteJa:
        "機械翻訳です。公式PDFを正本とし、OCR誤読や翻訳誤りを含む可能性があります。",
    };

    if (document?.documentStatus) {
      document.documentStatus.translationJa = "machine_translation";
      document.documentStatus.summary = "summary_generated";
      await writeFile(documentPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
    }

    await writeFile(target.translationPath, `${JSON.stringify(translation, null, 2)}\n`, "utf8");
    generated += 1;
    console.log(`Generated Japanese translation for ${target.ocr.recordId} (${generated}/${limitedTargets.length}).`);
  }

  console.log(`Generated Japanese translations for ${generated} document(s).`);
}

if (allMode) {
  await generateAllTranslations();
  process.exit(0);
}

for (const file of files) {
  if (!file.endsWith(".json")) {
    continue;
  }

  const documentId = file.replace(/\.json$/, "");
  const sample = samples[documentId];

  if (!sample) {
    continue;
  }

  const ocr = JSON.parse(await readFile(resolve(ocrDir, file), "utf8"));
  const documentPath = resolve(documentsDir, file);
  const document = JSON.parse(await readFile(documentPath, "utf8"));
  const translation = {
    documentId,
    recordId: ocr.recordId,
    fullTextJa: sample.fullTextJa,
    summaryJa: sample.summaryJa,
    summaryEn: sample.summaryEn,
    status: {
      translationJa: "machine_translation",
      summary: "summary_generated",
      humanReview: "unreviewed",
    },
    noteJa:
      "MVP用のサンプル機械翻訳です。公式PDFを正本とし、OCR誤読を含む可能性があります。",
  };

  document.documentStatus.translationJa = "machine_translation";
  document.documentStatus.summary = "summary_generated";

  await writeFile(resolve(translationsDir, file), `${JSON.stringify(translation, null, 2)}\n`, "utf8");
  await writeFile(documentPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  generated += 1;
}

console.log(`Generated Japanese translation samples for ${generated} document(s).`);
