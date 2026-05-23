import type { Metadata } from "next";
import Link from "next/link";
import { OhtsukiChecker } from "@/components/OhtsukiChecker";
import { ohtsukiConfig, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `${ohtsukiConfig.name} | ${ohtsukiConfig.label}`,
  description: ohtsukiConfig.description,
};

export default function OhtsukiPage() {
  return (
    <section className="checker-page">
      <div className="checker-hero">
        <p className="eyebrow">{siteConfig.shortName}</p>
        <h1>{ohtsukiConfig.name}</h1>
        <p className="tagline">{ohtsukiConfig.label}</p>
        <p className="lead">{ohtsukiConfig.description}</p>
      </div>

      <OhtsukiChecker />

      <Link className="text-link" href="/">
        ブランドサイトへ戻る
      </Link>
    </section>
  );
}
