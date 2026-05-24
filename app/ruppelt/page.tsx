import type { Metadata } from "next";
import Link from "next/link";
import pursueIndex from "@/data/pursue/pursue-records.json";
import { RuppeltBrowser } from "@/components/RuppeltBrowser";
import { siteConfig } from "@/lib/site";
import type { PursueIndex } from "@/lib/pursue";

export const metadata: Metadata = {
  title: "Ruppelt β | Ruppelt β - PURSUE日本語インデックス",
  description: "米政府UAP公開資料を、日本語でさくっと確認できる資料ブラウザです。",
  alternates: {
    canonical: "/ruppelt",
  },
  openGraph: {
    title: "Ruppelt β - PURSUE日本語インデックス",
    description: "米政府UAP公開資料をスマホでさくっと確認。",
    url: "/ruppelt",
    siteName: "UFO Lab Tokyo",
    images: [
      {
        url: "/ogp-ruppelt.jpg",
        width: 1200,
        height: 630,
        alt: "Ruppelt β - PURSUE日本語インデックス",
        type: "image/jpeg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ruppelt β - PURSUE日本語インデックス",
    description: "米政府UAP公開資料をスマホでさくっと確認。",
    images: ["/ogp-ruppelt.jpg"],
  },
  other: {
    "twitter:image:alt": "Ruppelt β - PURSUE日本語インデックス",
  },
};

export default function RuppeltPage() {
  return (
    <section className="checker-page ruppelt-page">
      <div className="checker-hero">
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
        <h1>Ruppelt β</h1>
        <p className="tagline">Ruppelt β - PURSUE日本語インデックス</p>
        <p className="lead">米政府UAP公開資料をスマホでさくっと確認。</p>
      </div>

      <RuppeltBrowser index={pursueIndex as PursueIndex} />

      <footer className="site-footer ohtsuki-footer">
        <Link href="/">東京UFO研究室</Link>
        <p>
          UFO Research Lab Tokyo <span>All rights reserved</span>
        </p>
        <p>&copy; 2026 東京UFO研究室</p>
      </footer>
    </section>
  );
}
