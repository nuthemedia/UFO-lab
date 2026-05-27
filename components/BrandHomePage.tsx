import Link from "next/link";
import { BrandChallenges } from "@/components/BrandChallenges";
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

          <BrandChallenges heading={content.challengesHeading} challenges={content.challenges} />

          <section className="brand-feedback-card" aria-labelledby="brand-feedback-heading">
            <p className="brand-feedback-label" id="brand-feedback-heading">
              {content.updateFeedback.heading}
            </p>
            <div className="brand-feedback-copy">
              {content.updateFeedback.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <a
              className="brand-feedback-action"
              href="https://x.com/UFOLabTokyo"
              target="_blank"
              rel="noreferrer noopener"
              aria-label={content.updateFeedback.cta}
              title={content.updateFeedback.cta}
            >
              <span className="brand-feedback-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                  <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
                </svg>
              </span>
            </a>
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
