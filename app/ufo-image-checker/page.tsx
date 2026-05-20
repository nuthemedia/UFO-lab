import type { Metadata } from "next";
import Link from "next/link";
import { checkerRoadmap } from "@/data/futureFeatures";

export const metadata: Metadata = {
  title: "UFO画像チェッカー",
  description: "UFO画像チェッカーの仮ページです。",
};

export default function UfoImageCheckerPage() {
  return (
    <section className="checker-page">
      <div className="checker-hero">
        <p className="eyebrow">Prototype</p>
        <h1>UFO画像チェッカー</h1>
        <p className="lead">
          ここは将来、画像をアップロードしてUFO・UAPらしさや別候補を確認するためのページです。
          現時点ではAI判定APIを接続せず、機能予定だけを表示しています。
        </p>
      </div>

      <div className="upload-placeholder" aria-label="画像アップロード予定エリア">
        <div className="placeholder-icon" aria-hidden="true" />
        <h2>画像チェック機能は準備中です</h2>
        <p>
          MVPの次の段階で、画像アップロード、解析結果、候補分類の表示を追加します。
        </p>
      </div>

      <section className="section checker-section">
        <div className="section-heading">
          <p className="eyebrow">Planned signals</p>
          <h2>将来の判定項目</h2>
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

      <Link className="text-link" href="/">
        トップページへ戻る
      </Link>
    </section>
  );
}
