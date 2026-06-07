import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";

const title = "Jacques v0.5 - 異なる怪異の同じ構造を可視化する";
const description =
  "UFO、妖精、神隠し、宗教的幻視のあいだに見られる共通モチーフを探索する知識可視化モック。";
const ogImage = "/jacques/vallee-og-card.png";
const twitterImage = "/jacques/vallee-x-card.png";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/jacques/icon.svg",
    shortcut: "/jacques/icon.svg",
    apple: "/jacques/icon.svg",
  },
  alternates: {
    canonical: "/jacques",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/jacques`,
    siteName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "黒地にジャック・ヴァレの白いシルエットを配したJacquesの共有カード",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [twitterImage],
  },
  other: {
    "twitter:image:alt": "黒地にジャック・ヴァレの白いシルエットを配したJacquesの共有カード",
  },
};

export default function JacquesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
