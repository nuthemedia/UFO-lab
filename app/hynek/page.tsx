import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { HynekFanTypeMockup } from "@/components/HynekFanTypeMockup";
import { siteConfig } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

const title = "Hynek v1 - UFOファンタイプ診断 | UFO Lab Tokyo";
const description =
  "UFO・宇宙人・アブダクション・コンタクティへの向き合い方から、あなたのUFO観測スタイルを診断します。";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/hynek",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/hynek`,
    siteName: "UFO Lab Tokyo",
    type: "website",
    images: [
      {
        url: "/hynek-top.png",
        width: 1023,
        height: 1537,
        alt: "Hynek v1 - UFOファンタイプ診断",
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
    "twitter:image:alt": "Hynek v1 - UFOファンタイプ診断",
  },
};

export default function HynekPage() {
  return (
    <section className="checker-page ruppelt-page hynek-page">
      <div className="checker-hero hynek-hero">
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
        <h1>Hynek v1</h1>
        <p className="tagline">Hynek v1 - UFOファンタイプ診断</p>
        <p className="lead">
          UFO・宇宙人・アブダクション・コンタクティについての考え方から、あなたのUFO観測スタイルを診断します。
          みんなの傾向も確認できます。
        </p>
      </div>
      <HynekFanTypeMockup />
      <SiteFooter className="hynek-footer" />
    </section>
  );
}
