import type { Metadata } from "next";
import Link from "next/link";
import { HynekDashboardMockup } from "@/components/HynekDashboardMockup";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import { getHynekDashboardData } from "@/lib/hynekStore";
import { siteUrl } from "@/lib/seo";

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
        url: "/hynek-top.png",
        width: 1023,
        height: 1537,
        alt: "日本のUFO観ダッシュボード",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/hynek-top.png"],
  },
  other: {
    "twitter:image:alt": "日本のUFO観ダッシュボード",
  },
};

export default async function HynekDashboardPage() {
  const dashboard = await getHynekDashboardData();

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
      <HynekDashboardMockup initialData={dashboard} />
      <SiteFooter className="hynek-footer" />
    </section>
  );
}
