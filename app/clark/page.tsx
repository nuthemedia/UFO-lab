import type { Metadata } from "next";
import { ClarkCaseCard } from "@/components/ClarkCaseCard";
import { ClarkFooter } from "@/components/ClarkFooter";
import styles from "@/components/clark.module.css";
import { clarkCases } from "@/data/clark/cases";
import { siteConfig } from "@/lib/site";

const title = "Clark - UFO事件と人物";
const description =
  "有名なUFO事件と人物をテキスト・映像・3D展示でたどるデジタル・ミュージアム。";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/clark",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title,
    description,
    url: "/clark",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/clark/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Clark - UFO事件と人物 の共有画像",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: "/clark/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Clark - UFO事件と人物 の共有画像",
      },
    ],
  },
};

export default function ClarkHomePage() {
  const featuredCases = clarkCases.filter((record) => record.slug === "kenneth-arnold");

  return (
    <main className={styles.page}>
      <section className={styles.homeHero}>
        <div className={styles.shell}>
          <span className={styles.homeEyebrow}>Night Digital Museum</span>
          <h1>
            <span>Clark</span>
            <span aria-hidden="true"> - </span>
            <span>UFO事件と人物</span>
          </h1>
          <p>有名なUFO事件と人物をテキスト・映像・3D展示でたどるデジタル・ミュージアム。</p>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.homeGrid}>
          {featuredCases.map((record) => (
            <ClarkCaseCard key={record.slug} record={record} />
          ))}
        </div>
      </section>
      <ClarkFooter />
    </main>
  );
}
