import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import { BiorhythmMachine } from "./BiorhythmMachine";

const title = "バイオリズムマシン | COMPUTER BIORHYTHM";
const description =
  "1980年代のコンピューター占い機をモチーフにした、娯楽用バイオリズム診断のWebモックアップです。";
const image = "/experiments/biorhythm/opengraph-image";
const imageAlt = "バイオリズムマシンのCRT画面を模した共有サムネイル";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/experiments/biorhythm",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/experiments/biorhythm`,
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

export default function BiorhythmPage() {
  return <BiorhythmMachine />;
}
