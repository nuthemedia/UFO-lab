import type { Metadata } from "next";
import Link from "next/link";
import { HynekDashboardMockup } from "@/components/HynekDashboardMockup";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import { getHynekDashboardSubmissions } from "@/lib/hynekStore";
import { siteUrl } from "@/lib/seo";
import { withHynekSocialImageVersion } from "@/lib/hynekShare";

export const dynamic = "force-dynamic";

const title = "日本のUFO観ダッシュボード | UFO Lab Tokyo";
const description = "UFOファンタイプ診断の匿名回答から、日本のUFO観の傾向を可視化するダッシュボードです。";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/hynek/dashboard",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/hynek/dashboard`,
    siteName: "UFO Lab Tokyo",
    type: "website",
    images: [
      {
        url: withHynekSocialImageVersion(`${siteUrl}/hynek-dashboard-og.jpg`),
        width: 1200,
        height: 630,
        alt: "日本のUFO観ダッシュボード",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [withHynekSocialImageVersion(`${siteUrl}/hynek-dashboard-og.jpg`)],
  },
  other: {
    "twitter:image:alt": "日本のUFO観ダッシュボード",
  },
};

export default async function HynekDashboardPage() {
  const submissions = await getHynekDashboardSubmissions();

  return (
    <section className="checker-page ruppelt-page hynek-page hynek-dashboard-page">
      <div className="checker-hero hynek-hero hynek-dashboard-hero">
        <div className="ohtsuki-brand-mark" aria-label={siteConfig.shortName}>
          <div className="orbital-mark orbital-mark-compact" aria-hidden="true">
            <span className="orbit-ring orbit-ring-one" />
            <span className="orbit-ring orbit-ring-two" />
            <span className="orbit-ring orbit-ring-three" />
            <span className="orbit-dot orbit-dot-one" />
            <span className="orbit-dot orbit-dot-two" />
            <span className="orbit-dot orbit-dot-three" />
            <span className="ohtsuki-brand-text">{siteConfig.shortName}</span>
          </div>
          <span className="sr-only">{siteConfig.shortName}</span>
        </div>
        <p className="tagline">Hynek v1 - UFOファンタイプ診断</p>
        <h1>日本のUFO観ダッシュボード</h1>
        <p className="lead">診断参加者の匿名回答を集計し、みんなのUFO観の傾向を可視化します。</p>
        <div className="hynek-dashboard-hero-actions">
          <Link className="hynek-primary" href="/hynek">
            あなたも診断に参加する
          </Link>
        </div>
      </div>
      <HynekDashboardMockup submissions={submissions} />
      <section className="brand-feedback-card hynek-dashboard-update-card" aria-labelledby="hynek-dashboard-update-heading">
        <p className="brand-feedback-label" id="hynek-dashboard-update-heading">
          更新情報・フィードバック
        </p>
        <div className="brand-feedback-copy">
          <p>今後も新しいアプリを追加していきます。</p>
          <p>更新情報はXで発信しているので、ぜひフォローしてください。</p>
        </div>
        <a
          className="brand-feedback-action"
          href="https://x.com/UFOLabTokyo"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Xをフォロー"
          title="Xをフォロー"
        >
          <span className="brand-feedback-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
            </svg>
          </span>
        </a>
      </section>
      <SiteFooter className="hynek-footer" />
    </section>
  );
}
