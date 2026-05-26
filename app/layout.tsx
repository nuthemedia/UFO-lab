import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { createHomeMetadata, siteUrl } from "@/lib/seo";
import "./globals.css";

const metadataBaseUrl =
  process.env.NODE_ENV === "production"
    ? siteUrl
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  ...createHomeMetadata("ja"),
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
        <Analytics />
      </body>
    </html>
  );
}
