import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { HynekFanTypeMockup } from "@/components/HynekFanTypeMockup";
import { siteConfig } from "@/lib/site";
import { siteUrl } from "@/lib/seo";
import { getHynekShareImagePath, getHynekShareLabel, withHynekSocialImageVersion } from "@/lib/hynekShare";

export const dynamic = "force-dynamic";

export const dynamic = "force-dynamic";

const title = "Hynek v1 - UFOファンタイプ診断 | UFO Lab Tokyo";
const description =
  "UFO・宇宙人・アブダクション・コンタクティへの向き合い方から、あなたのUFO観測スタイルを診断します。";

type HynekPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: HynekPageProps): Promise<Metadata> {
  const params = searchParams || {};
  const resultType = firstValue(params.resultType);
  const gender = firstValue(params.gender);
  const shareImagePath = getHynekShareImagePath(resultType, gender);
  const resultLabel = shareImagePath ? getHynekShareLabel(resultType) : null;

  const imageUrl = shareImagePath
    ? withHynekSocialImageVersion(`${siteUrl}${shareImagePath}`)
    : withHynekSocialImageVersion(`${siteUrl}/hynek-og.jpg`);
  const imageAlt = resultLabel
    ? `${resultLabel}の診断結果画像`
    : "Hynek v1 - UFOファンタイプ診断の紹介画像";
  const dynamicTitle = resultLabel ? `${resultLabel} | UFO Lab Tokyo` : title;

  return {
    title: dynamicTitle,
    description,
    alternates: {
      canonical: "/hynek",
    },
    openGraph: {
      title: dynamicTitle,
      description,
      url: `${siteUrl}/hynek`,
      siteName: "UFO Lab Tokyo",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dynamicTitle,
      description,
      images: [imageUrl],
    },
    other: {
      "twitter:image:alt": imageAlt,
    },
  };
}

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
