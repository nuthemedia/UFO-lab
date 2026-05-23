"use client";

import { useEffect, useMemo, useState } from "react";
import { checkerRoadmap } from "@/data/futureFeatures";

type ImageState = {
  name: string;
  size: number;
  previewUrl: string;
};

function formatSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function OhtsukiChecker() {
  const [image, setImage] = useState<ImageState | null>(null);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [image]);

  const mockScore = useMemo(() => {
    if (!image) {
      return null;
    }

    return Math.min(84, Math.max(18, Math.round((image.name.length * 7 + image.size / 4096) % 100)));
  }, [image]);

  return (
    <div className="ohtsuki-tool">
      <label className="upload-zone">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              setImage(null);
              return;
            }

            setImage({
              name: file.name,
              size: file.size,
              previewUrl: URL.createObjectURL(file),
            });
          }}
        />
        <span className="placeholder-icon" aria-hidden="true" />
        <strong>画像を選択</strong>
        <span>JPG、PNG、WebP などの画像をローカルでプレビューします</span>
      </label>

      <div className="result-panel">
        {image ? (
          <>
            <div className="preview-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={`${image.name}のプレビュー`} />
            </div>
            <div className="result-summary">
              <p className="eyebrow">Beta result</p>
              <h2>AI生成・加工の可能性: {mockScore}%</h2>
              <p>
                この数値はUI検証用の仮スコアです。正式版では画像特徴、メタデータ、
                生成AI由来の痕跡を組み合わせて判定します。
              </p>
              <dl>
                <div>
                  <dt>ファイル名</dt>
                  <dd>{image.name}</dd>
                </div>
                <div>
                  <dt>サイズ</dt>
                  <dd>{formatSize(image.size)}</dd>
                </div>
              </dl>
            </div>
          </>
        ) : (
          <div className="empty-result">
            <p className="eyebrow">Waiting image</p>
            <h2>画像を選ぶと判定カードを表示します</h2>
            <p>このβ版では画像はアップロードされず、ブラウザ内のプレビューだけを扱います。</p>
          </div>
        )}
      </div>

      <section className="section checker-section">
        <div className="section-heading">
          <p className="eyebrow">Signals</p>
          <h2>判定で見る観点</h2>
        </div>
        <div className="signal-list">
          {checkerRoadmap.map((item) => (
            <article key={item} className="signal-item">
              <span aria-hidden="true" />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
