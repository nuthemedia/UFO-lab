import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const saucerpediaOgImage = "/saucerpedia/opengraph-image";
export const saucerpediaImageAlt =
  "淡い背景に本の束と空飛ぶ円盤辞典のタイトルを配したSaucerpedia共有カード";

export const saucerpediaKeywords = [
  "UFO",
  "UAP",
  "空飛ぶ円盤",
  "UFO辞典",
  "UFO用語",
  "UFO事件",
  "UFO人物",
  "UFO資料",
  "UFO史",
  "誤認",
  "フェイク",
  "現代UAP",
  "ロズウェル",
  "Project Blue Book",
  "AARO",
  "UFO Lab Tokyo",
];

type SaucerpediaMetadataInput = {
  canonical: string;
  description: string;
  title: string;
};

export function createSaucerpediaMetadata({ canonical, description, title }: SaucerpediaMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    keywords: saucerpediaKeywords,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.shortName,
      locale: "ja_JP",
      type: "website",
      images: [
        {
          url: saucerpediaOgImage,
          width: 1200,
          height: 630,
          alt: saucerpediaImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [saucerpediaOgImage],
    },
    other: {
      "twitter:image:alt": saucerpediaImageAlt,
    },
  };
}
