"use client";

import { useEffect, useState } from "react";

type ImageState = {
  file: File;
  previewUrl: string;
};

type AnalysisResult = {
  verdict: {
    level: string;
    title: string;
    message: string;
  };
  strongEvidence: string[];
  sightengine: {
    used: boolean;
    available: boolean;
    aiScore: number | null;
    generators: Record<string, number> | null;
    note: string;
  };
  analysisMode: "simple" | "detailed";
  analysisNotice: string;
  file: {
    name: string;
    size: number;
    type: string;
  };
  quota: {
    isDeveloper: boolean;
    canUseSightengine: boolean;
    reason: string;
    message: string | null;
    userDailyUsed: number;
    userDailyRemaining: number;
    userDaily: number;
    dailyTotalUsed: number;
    dailyTotalRemaining: number;
    monthlyTotalUsed: number;
    monthlyTotalRemaining: number;
  };
  policyNotice: string;
};

function formatSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatScore(score: number | null) {
  return score === null ? "利用不可" : `${Math.round(score * 100)}%`;
}

function isAcceptedImage(file: File) {
  const name = file.name.toLowerCase();
  const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  return (
    acceptedTypes.has(file.type) ||
    /\.(jpe?g|png|webp)$/.test(name)
  );
}

function isLocalHost() {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

export function OhtsukiChecker() {
  const [image, setImage] = useState<ImageState | null>(null);
  const [claimedYear, setClaimedYear] = useState("");
  const [developerToken, setDeveloperToken] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeveloperMode, setShowDeveloperMode] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    setIsLocal(isLocalHost());
  }, []);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [image]);

  function selectImage(file: File | undefined) {
    if (!file) {
      setImage(null);
      return;
    }

    if (!isAcceptedImage(file)) {
      setError("対応形式はJPEG、PNG、WebPです。");
      return;
    }

    if (image) {
      URL.revokeObjectURL(image.previewUrl);
    }

    setImage({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setResult(null);
    setError("");
  }

  async function submitAnalysis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!image) {
      setError("画像ファイルを選択してください。");
      return;
    }

    const formData = new FormData();
    formData.append("image", image.file);
    formData.append("claimedYear", claimedYear);

    setIsSubmitting(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch("/api/ohtsuki/analyze", {
        method: "POST",
        body: formData,
        headers: isLocal && showDeveloperMode && developerToken
          ? {
              "x-ohtsuki-developer-token": developerToken,
            }
          : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "判定に失敗しました。");
        return;
      }

      setResult(payload as AnalysisResult);
    } catch {
      setError("判定APIに接続できませんでした。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="ohtsuki-tool" onSubmit={submitAnalysis}>
      <div className="checker-grid">
        <div className="input-panel">
          <label className={`upload-zone ${image ? "upload-zone-has-image" : ""}`}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => selectImage(event.target.files?.[0])}
            />
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="upload-preview" src={image.previewUrl} alt={`${image.file.name}のプレビュー`} />
                <span className="upload-overlay">
                  <strong>画像を選択</strong>
                  <span>{image.file.name}</span>
                  <span>{formatSize(image.file.size)}</span>
                </span>
              </>
            ) : (
              <>
                <span className="placeholder-icon" aria-hidden="true" />
                <strong>画像を選択</strong>
                <span>JPEG、PNG、WebP / 10MB以下</span>
              </>
            )}
          </label>

          <div className="field-grid">
            <label>
              <span>撮影年とされる年</span>
              <input
                type="number"
                min="1800"
                max="2100"
                value={claimedYear}
                onChange={(event) => setClaimedYear(event.target.value)}
                placeholder="例: 2018"
              />
            </label>
          </div>

          {isLocal ? (
            <>
              <button
                className="text-link developer-toggle"
                type="button"
                onClick={() => setShowDeveloperMode((value) => !value)}
              >
                管理者モード
              </button>
              {showDeveloperMode ? (
                <div className="field-grid">
                  <label>
                    <span>管理者トークン</span>
                    <input
                      type="password"
                      value={developerToken}
                      onChange={(event) => setDeveloperToken(event.target.value)}
                      placeholder="local-dev"
                    />
                  </label>
                </div>
              ) : null}
            </>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-action analyze-button" type="submit" disabled={isSubmitting || !image}>
            {isSubmitting ? "判定中..." : "AI生成・AI加工の可能性を判定"}
          </button>
        </div>

        <div className="result-panel result-panel-stack">
          {result ? (
            <div className={`analysis-card verdict-${result.verdict.level}`}>
              <p className="eyebrow">{result.analysisMode === "detailed" ? "Detailed result" : "Simple result"}</p>
              <h2>{result.verdict.title}</h2>
              <p>{result.verdict.message}</p>
              <p className="policy-note">{result.analysisNotice}</p>
              {result.quota.message ? <p className="policy-note">{result.quota.message}</p> : null}
              <dl className="result-facts">
                <div>
                  <dt>Sightengine推定</dt>
                  <dd>{result.sightengine.used ? formatScore(result.sightengine.aiScore) : "未使用"}</dd>
                </div>
                <div>
                  <dt>Sightengine状態</dt>
                  <dd>{result.sightengine.note}</dd>
                </div>
              <div>
                <dt>ユーザー回数</dt>
                  <dd>
                    {result.quota.userDailyUsed} / 3
                    <br />
                    残り {result.quota.userDailyRemaining}
                  </dd>
              </div>
                <div>
                  <dt>本日の総回数</dt>
                  <dd>
                    {result.quota.dailyTotalUsed} / 500
                    <br />
                    残り {result.quota.dailyTotalRemaining}
                  </dd>
                </div>
                <div>
                  <dt>今月の総回数</dt>
                  <dd>
                    {result.quota.monthlyTotalUsed} / 2000
                    <br />
                    残り {result.quota.monthlyTotalRemaining}
                  </dd>
                </div>
                <div>
                  <dt>強い証拠</dt>
                  <dd>{result.strongEvidence.length > 0 ? result.strongEvidence.join(" / ") : "未検出"}</dd>
                </div>
                <div>
                  <dt>ファイル</dt>
                  <dd>
                    {result.file.name} / {formatSize(result.file.size)}
                  </dd>
                </div>
              </dl>
              <p className="policy-note">{result.policyNotice}</p>
            </div>
          ) : (
            <div className="empty-result">
              <p className="eyebrow">Waiting result</p>
              <h2>画像を選ぶと判定カードを表示します</h2>
              <p>アップロードした画像は左の「画像を選択」エリアに表示されます。</p>
            </div>
          )}

          <div className="result-summary-ohtsuki">
            <p className="eyebrow">Signals</p>
            <h2>判定で見る観点</h2>
            <ul className="signal-list">
              <li>画像のメタデータ</li>
              <li>生成AI由来の痕跡</li>
              <li>撮影年・初出年</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
