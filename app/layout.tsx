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
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  ...createHomeMetadata("ja"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta
          name="google-site-verification"
          content="bKtzjyNwFuJ0x8lZlkvvmLTKSax7Ot9pu8C44_alI-c"
        />
      </head>
      <body>
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
