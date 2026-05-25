import Link from "next/link";
import { BrandVideo } from "@/components/BrandVideo";
import { SiteFooter } from "@/components/SiteFooter";
import { ohtsukiConfig, siteConfig } from "@/lib/site";

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
              <p>
                <span className="tagline-desktop">{siteConfig.tagline}</span>
                <span className="tagline-mobile" aria-hidden="true">
                  UFOはまだ解明されていないが
                  <br />
                  確かに実在する現象である
                </span>
              </p>
              <p>
                <span className="tagline-desktop">
                  UFOs are phenomena that remain unexplained, yet undeniably exist.
                </span>
                <span className="tagline-mobile" aria-hidden="true">
                  UFOs remain unexplained,
                  <br />
                  yet undeniably exist.
                </span>
              </p>
            </div>
          </div>

          <section className="mission-block" aria-labelledby="mission-heading">
            <p className="mission-label" id="mission-heading">Mission</p>
            <p className="mission-copy">ソフトウェアの魔法で、UFOコミュニティに貢献する</p>
            <p className="mission-copy-en">
              Contributing to the UFO community through the magic of software.
            </p>
          </section>

          <BrandVideo />

          <p className="brand-update">
            <span>Update</span>
            Ruppelt v1.1にファイルの公開情報が追加されました。
          </p>

          <div className="otsuki-showcase">
            <article className="otsuki-card">
              <p className="eyebrow">Version 1.1</p>
              <h2>Ruppelt v1.1</h2>
              <p className="otsuki-title">Ruppelt v1.1 – PURSUE日本語インデックス</p>
              <Link className="primary-action" href={{ pathname: "/ruppelt" }}>
                Ruppeltを開く
              </Link>
            </article>
            <article className="otsuki-card">
              <p className="eyebrow">Version 0.5 Beta</p>
              <h2>{ohtsukiConfig.name}</h2>
              <p className="otsuki-title">
                {ohtsukiConfig.name} – {ohtsukiConfig.label}
              </p>
              <Link className="primary-action" href="/ohtsuki">
                Ohtsukiを開く
              </Link>
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
