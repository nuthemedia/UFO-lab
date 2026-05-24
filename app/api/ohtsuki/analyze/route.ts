import { NextResponse } from "next/server";
import {
  buildQuotaStatus,
  getOhtsukiUserId,
  getUsageSnapshot,
  isDeveloperRequest,
  recordDetailedUsage,
} from "@/lib/ohtsukiUsage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SIGHTENGINE_TIMEOUT_MS = 15000;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const STRONG_EVIDENCE_PATTERNS = [
  { label: "C2PA / Content Credentials", pattern: /c2pa|content credentials|contentcredentials/i },
  { label: "SynthID", pattern: /synthid/i },
  { label: "Stable Diffusion", pattern: /stable diffusion|automatic1111|a1111|comfyui/i },
  { label: "Midjourney", pattern: /midjourney/i },
  { label: "DALL-E", pattern: /dall[- ]?e/i },
  { label: "Adobe Firefly", pattern: /firefly/i },
  { label: "Flux", pattern: /\bflux\b/i },
  { label: "Imagen", pattern: /\bimagen\b/i },
  { label: "Ideogram", pattern: /ideogram/i },
  { label: "AI generation metadata", pattern: /prompt|negative prompt|seed|sampler|cfg scale|steps/i },
];

type SightengineResponse = {
  status?: string;
  type?: {
    ai_generated?: number;
    ai_generators?: Record<string, number>;
  };
  error?: {
    message?: string;
  };
};

function isAcceptedImage(file: File) {
  const name = file.name.toLowerCase();

  return ACCEPTED_TYPES.has(file.type) || /\.(jpe?g|png|webp)$/.test(name);
}

function readYear(formData: FormData) {
  const raw = String(formData.get("claimedYear") || "").trim();
  const year = Number.parseInt(raw, 10);

  return Number.isInteger(year) && year > 0 ? year : null;
}

function scanStrongEvidence(buffer: Buffer) {
  const text = buffer.toString("latin1");

  return Array.from(
    new Set(
      STRONG_EVIDENCE_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label),
    ),
  );
}

function verdict(aiScore: number | null, strongEvidence: string[], oldYear: number | null) {
  if (strongEvidence.length > 0) {
    return {
      level: "confirmed_ai",
      title: "AI生成画像です",
      message: "生成AI由来を示す強い証拠が画像ファイル内から検出されました。",
    };
  }

  if (oldYear && oldYear <= 2022) {
    return {
      level: "low",
      title: "現代的なAI生成画像ではない可能性が高い",
      message: "2022年以前の撮影年情報があるため、外部AI判定APIを使わず簡易判定として表示しています。",
    };
  }

  if (aiScore === null) {
    return {
      level: "unknown",
      title: "判定材料が不足しています",
      message: "外部AI判定APIを利用できなかったため、メタデータとファイル情報のみを表示しています。",
    };
  }

  if (aiScore >= 0.85) {
    return {
      level: "high",
      title: "AI生成・AI加工画像の可能性が高い",
      message: "Sightengineの推定スコアは高いですが、強い証拠がないため断定はしません。",
    };
  }

  if (aiScore >= 0.55) {
    return {
      level: "medium",
      title: "AI生成・AI加工画像の可能性があります",
      message: "画像特徴から一定の可能性が示されています。",
    };
  }

  return {
    level: "low",
    title: "強いAI生成・AI加工の兆候は確認できません",
    message: "この判定材料では強い兆候はありません。ただし、AI由来ではないことやUFOの真偽は断定しません。",
  };
}

async function callSightengine(file: File) {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    return {
      used: false,
      available: false,
      aiScore: null,
      generators: null,
      note: "Sightengine APIキーが未設定です。",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SIGHTENGINE_TIMEOUT_MS);
  const formData = new FormData();
  formData.append("media", file, file.name);
  formData.append("models", "genai");
  formData.append("api_user", apiUser);
  formData.append("api_secret", apiSecret);

  try {
    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    const payload = (await response.json()) as SightengineResponse;

    if (!response.ok || payload.status === "failure") {
      return {
        used: true,
        available: false,
        aiScore: null,
        generators: null,
        note: payload.error?.message || "Sightengine判定に失敗しました。",
      };
    }

    return {
      used: true,
      available: true,
      aiScore: typeof payload.type?.ai_generated === "number" ? payload.type.ai_generated : null,
      generators: payload.type?.ai_generators || null,
      note: "Sightengine genai による推定結果です。",
    };
  } catch {
    return {
      used: true,
      available: false,
      aiScore: null,
      generators: null,
      note: "Sightengine判定がタイムアウトまたは接続失敗しました。簡易判定として表示しています。",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");
  const oldYear = readYear(formData);
  const userId = getOhtsukiUserId(request) || crypto.randomUUID();
  const isDeveloper = isDeveloperRequest(request);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
  }

  if (!isAcceptedImage(file)) {
    return NextResponse.json({ error: "対応形式はJPEG、PNG、WebPです。" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "画像サイズは10MB以下にしてください。" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const strongEvidence = scanStrongEvidence(buffer);
  const shouldSkipSightengine = strongEvidence.length > 0 || Boolean(oldYear && oldYear <= 2022);
  const snapshotBefore = await getUsageSnapshot(userId);
  const quota = buildQuotaStatus(
    snapshotBefore,
    isDeveloper,
    Boolean(process.env.SIGHTENGINE_API_USER && process.env.SIGHTENGINE_API_SECRET),
  );
  const simpleSkipNotice = shouldSkipSightengine
    ? strongEvidence.length > 0
      ? "自前判定で生成AI由来の強い証拠を検出したため、Sightengineは使用していません。"
      : "2022年以前の撮影年情報があるため、Sightengineは使用していません。"
    : quota.notice;

  let sightengine = {
    used: false,
    available: false,
    aiScore: null as number | null,
    generators: null as Record<string, number> | null,
    note: simpleSkipNotice,
  };

  if (!shouldSkipSightengine && quota.canUseSightengine) {
    sightengine = await callSightengine(file);

    if (sightengine.used) {
      await recordDetailedUsage(userId, isDeveloper);
    }
  }

  const snapshotAfter = sightengine.used ? await getUsageSnapshot(userId) : snapshotBefore;

  const response = NextResponse.json({
    verdict: verdict(sightengine.aiScore, strongEvidence, oldYear),
    strongEvidence,
    sightengine,
    analysisMode: sightengine.available ? "detailed" : "simple",
    analysisNotice: sightengine.available
      ? "この判定は、メタデータ検査と外部AI判定APIの結果を組み合わせた詳細判定です。"
      : "この判定は、メタデータとファイル情報に基づく簡易判定です。",
    quota: {
      isDeveloper,
      canUseSightengine: quota.canUseSightengine,
      reason: quota.reason,
      message: shouldSkipSightengine
        ? simpleSkipNotice
        : sightengine.available
          ? null
          : sightengine.note,
      userDaily: quota.userRemaining,
      userDailyRemaining: quota.userRemaining,
      dailyTotalRemaining: quota.dailyRemaining,
      monthlyTotalRemaining: quota.monthlyRemaining,
      userDailyUsed: snapshotAfter.userDaily,
      dailyTotalUsed: snapshotAfter.dailyTotal,
      monthlyTotalUsed: snapshotAfter.monthlyTotal,
    },
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
    policyNotice:
      "このツールはUFOの正体や宇宙人の有無を判定しません。画像がAI生成・AI加工された可能性だけを調べます。",
  });

  if (!request.headers.get("cookie")?.includes("ohtsuki_user_id=")) {
    response.cookies.set("ohtsuki_user_id", userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}
