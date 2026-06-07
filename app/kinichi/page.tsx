import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { KinichiTopPage } from "./KinichiTopPage";
import { kinichiShareImage } from "./metadata";

const title = "Kinichi | UFO形体事典";
const description =
  "円盤、球体、葉巻型、三角形、Tic Tacなど、UFOの代表的な形体を3Dモデル、2Dシルエット、代表事件、NUFORC分類で見る形体事典。";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/kinichi",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: "/kinichi",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    images: [
      {
        url: kinichiShareImage,
        width: 1200,
        height: 630,
        alt: title,
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [kinichiShareImage],
  },
  other: {
    "twitter:image:alt": title,
  },
};

export default function KinichiPage() {
  return <KinichiTopPage />;
}
