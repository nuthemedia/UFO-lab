import type { Metadata } from "next";
import "./globals.css";

const productionSiteUrl = "https://ufo-lab.vercel.app";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production"
    ? productionSiteUrl
    : "http://localhost:3000");
const siteTitle = "UFO Lab Tokyo";
const siteDescription =
  "東京UFO研究室。UFO・UAPをめぐる画像、資料、公開情報を検証するための実験的ラボ。";
const ogpImage = "/ogp-brand.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    images: [
      {
        url: ogpImage,
        width: 1200,
        height: 630,
        alt: siteTitle,
        type: "image/jpeg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogpImage],
  },
  other: {
    "twitter:image:alt": siteTitle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
