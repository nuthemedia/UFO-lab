import Link from "next/link";
import { researchPillars } from "@/data/futureFeatures";
import { ohtsukiConfig, siteConfig } from "@/lib/site";

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
          <p className="eyebrow">{siteConfig.englishName}</p>
          <h1>{siteConfig.formalName}</h1>
          <p className="tagline">{siteConfig.tagline}</p>
          <p className="lead">{siteConfig.description}</p>
          <div className="hero-actions">
            <Link className="primary-action" href="/ohtsuki">
              Ohtsukiを開く
            </Link>
            <Link className="secondary-action" href="#about">
              研究室について
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="section intro-section">
        <div className="section-heading">
          <p className="eyebrow">{siteConfig.shortName}</p>
          <h2>未知を、未知のまま雑に扱わない。</h2>
        </div>
        <div className="split-layout">
          <div>
            <p>
              東京UFO研究室は、UFO・UAPを娯楽や断定だけに閉じ込めず、
              観察可能な現象として記録し、検証し、語り直すための小さな研究室です。
            </p>
            <p>
              まだ説明できないものを、ただちに本物とも偽物とも決めつけない。
              その態度から、ブランドサイトと画像判定ツール Ohtsuki を育てていきます。
            </p>
          </div>
          <aside className="statement-panel" aria-label="ブランド表記">
            <span>正式名称</span>
            <strong>{siteConfig.formalName}</strong>
            <span>English</span>
            <strong>{siteConfig.englishName}</strong>
            <span>Logo</span>
            <strong>{siteConfig.shortName}</strong>
          </aside>
        </div>
      </section>

      <section className="section muted-section">
        <div className="section-heading">
          <p className="eyebrow">Research stance</p>
          <h2>研究室の中心に置くこと</h2>
        </div>
        <div className="feature-grid">
          {researchPillars.map((pillar, index) => (
            <article className="feature-card" key={pillar.title}>
              <span className="feature-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="product-band">
        <div>
          <p className="eyebrow">First product</p>
          <h2>{ohtsukiConfig.name}</h2>
          <p className="lead">{ohtsukiConfig.label}</p>
          <p>{ohtsukiConfig.description}</p>
        </div>
        <Link className="primary-action" href="/ohtsuki">
          β版を見る
        </Link>
      </section>
    </>
  );
}
