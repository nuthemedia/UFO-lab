import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="brand-home">
        <div className="brand-home-inner">
          <div className="brand-copy">
            <div className="orbital-mark">
              <span className="orbit-ring orbit-ring-one" aria-hidden="true" />
              <span className="orbit-ring orbit-ring-two" aria-hidden="true" />
              <span className="orbit-ring orbit-ring-three" aria-hidden="true" />
              <span className="orbit-dot orbit-dot-one" aria-hidden="true" />
              <span className="orbit-dot orbit-dot-two" aria-hidden="true" />
              <span className="orbit-dot orbit-dot-three" aria-hidden="true" />
              <h1 className="brand-logo">{siteConfig.shortName}</h1>
            </div>
            <div className="brand-taglines">
              <p>{siteConfig.tagline}</p>
              <p>UFOs are phenomena that remain unexplained, yet undeniably exist.</p>
            </div>
          </div>

          <div className="otsuki-showcase">
            <article className="otsuki-card">
              <p className="eyebrow">Version 1 Beta</p>
              <h2>Otsuki</h2>
              <p className="otsuki-title">Otsuki – UFO画像AI判定チェッカー</p>
              <Link className="primary-action" href="/apps/ufo-image-checker">
                Otsukiを開く
              </Link>
            </article>
            <p className="otsuki-note">UFO画像がAI生成かどうかをチェックするツール</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>東京UFO研究室</p>
        <p>UFO Research Lab Tokyo <span>All rights reserved</span></p>
        <p>&copy; 2026 東京UFO研究室</p>
      </footer>
    </>
  );
}
