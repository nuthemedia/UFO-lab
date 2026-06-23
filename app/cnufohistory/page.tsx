import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import { CnUfoHistoryApp } from "./CnUfoHistoryApp";

const title = "中国UFO史年表 | UFO Lab Tokyo";
const description =
  "中国UFO史を、研究会、重大事件、雑誌文化、ブーム、ネット文化から時系列で読むスマホ向け年表アプリ。";
const image = "/cnufohistory/x-card.png";
const imageAlt = "中国UFO史年表。研究会、重大事件、カルチャーを読むUFO Lab Tokyoの年表アプリ";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "中国UFO史",
    "中国 UFO",
    "中国UAP",
    "中国UFO年表",
    "中国UFO研究会",
    "飞碟探索",
    "中国UFO事件",
    "杭州蕭山空港UFO事件",
    "孟照国",
    "貴州空中怪車",
    "UFO Lab Tokyo",
  ],
  alternates: {
    canonical: "/cnufohistory",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/cnufohistory`,
    siteName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: imageAlt,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
  other: {
    "twitter:image:alt": imageAlt,
  },
};

export default function CnUfoHistoryPage() {
  return <CnUfoHistoryApp />;
}
