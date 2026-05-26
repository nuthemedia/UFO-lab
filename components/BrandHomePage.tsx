import Link from "next/link";
import { BrandVideo } from "@/components/BrandVideo";
import { SiteFooter } from "@/components/SiteFooter";
import { brandHomeContent, type BrandLocale } from "@/lib/brandHomeContent";
import { organizationJsonLd } from "@/lib/seo";

type BrandHomePageProps = {
  locale: BrandLocale;
};

function MobileTagline({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={line}>
          {index > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </>
  );
}

export function BrandHomePage({ locale }: BrandHomePageProps) {
  const content = brandHomeContent[locale];
  const hasSecondaryTagline =
    content.taglines.secondaryDesktop || content.taglines.secondaryMobile.length > 0;

  return (
    <div lang={content.htmlLang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <nav className="brand-language-floating" aria-label="Language">
        <span aria-current="page">{content.currentLabel}</span>
        <Link href={content.alternatePath}>{content.alternateLabel}</Link>
      </nav>

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
              <h1 className="brand-logo">{content.logo}</h1>
            </div>
            <div className="brand-taglines">
              <p>
                <span className="tagline-desktop">{content.taglines.primaryDesktop}</span>
                <span className="tagline-mobile" aria-hidden="true">
                  <MobileTagline lines={content.taglines.primaryMobile} />
                </span>
              </p>
              {hasSecondaryTagline ? (
                <p>
                  <span className="tagline-desktop">{content.taglines.secondaryDesktop}</span>
                  <span className="tagline-mobile" aria-hidden="true">
                    <MobileTagline lines={content.taglines.secondaryMobile} />
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <section className="mission-block" aria-labelledby="mission-heading">
            <p className="mission-label" id="mission-heading">
              Mission
            </p>
            <p className="mission-copy">{content.mission}</p>
          </section>

          <BrandVideo />

          <section className="brand-challenges" aria-labelledby="brand-challenges-heading">
            <div className="brand-challenges-header">
              <p className="mission-label">Challenges</p>
              <h2 id="brand-challenges-heading">{content.challengesHeading}</h2>
            </div>
            <div className="brand-challenge-grid">
              {content.challenges.map((challenge, index) => (
                <div className="brand-challenge-item" key={challenge.title}>
                  <input
                    className="brand-challenge-radio"
                    type="radio"
                    id={`${locale}-brand-challenge-${index + 1}`}
                    name={`${locale}-brand-challenge`}
                    defaultChecked={index === 0}
                  />
                  <label
                    className="brand-challenge-tab"
                    htmlFor={`${locale}-brand-challenge-${index + 1}`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{challenge.title}</strong>
                  </label>
                  <article className="brand-challenge-panel">
                    <p className="brand-challenge-panel-number">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3>{challenge.title}</h3>
                    <p>{challenge.description}</p>
                  </article>
                </div>
              ))}
            </div>
          </section>

          <p className="brand-update">
            <span>Update</span>
            {content.update}
          </p>

          <div className="otsuki-showcase">
            {content.products.map((product) => (
              <article className="otsuki-card" key={product.name}>
                <p className="eyebrow">{product.version}</p>
                <h2>{product.name}</h2>
                <p className="otsuki-title">{product.title}</p>
                <Link className="primary-action" href={product.href}>
                  {product.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter content={content.footer} />
    </div>
  );
}
