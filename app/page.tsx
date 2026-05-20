import Link from "next/link";
import { checkerRoadmap, futureFeatures } from "@/data/futureFeatures";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <div className="skyline" />
          <div className="ufo-beam" />
          <div className="ufo-body" />
        </div>
        <div className="hero-content">
          <p className="eyebrow">UFO・UAP observation lab</p>
          <h1>UFOlab</h1>
          <p className="lead">
            未確認の光、写真、目撃談を冷静に見つめるための小さな実験場です。
            最初のMVPではトップページとUFO画像チェッカーから始めます。
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/ufo-image-checker">
              UFO画像チェッカーへ
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">MVP focus</p>
          <h2>最初に作るもの</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-number">01</span>
            <h3>トップページ</h3>
            <p>
              UFOlabの入口として、プロジェクトの方向性と初期機能への導線を用意します。
            </p>
          </article>
          <article className="feature-card">
            <span className="feature-number">02</span>
            <h3>UFO画像チェッカー</h3>
            <p>
              本物のAI判定APIを使う前の仮ページとして、将来の解析項目を確認できます。
            </p>
          </article>
        </div>
      </section>

      <section className="section muted-section">
        <div className="section-heading">
          <p className="eyebrow">Roadmap</p>
          <h2>将来追加予定</h2>
        </div>
        <ul className="pill-list" aria-label="将来追加予定の機能">
          {futureFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <div className="roadmap-panel">
          <h3>画像チェッカーで扱う予定の観点</h3>
          <ul>
            {checkerRoadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
