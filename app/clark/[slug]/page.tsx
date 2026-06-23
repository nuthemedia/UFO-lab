import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClarkCasePage } from "@/components/ClarkCasePage";
import { clarkCases, getClarkCase } from "@/data/clark/cases";
import { siteConfig } from "@/lib/site";

type ClarkCaseRouteProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export function generateStaticParams() {
  return clarkCases.map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: ClarkCaseRouteProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const record = getClarkCase(slug);

  if (!record) {
    return {
      title: "Clark",
    };
  }

  const title = `${record.displayTitleJa} | Clark - UFO事件と人物`;
  const ogImage =
    record.slug === "kenneth-arnold"
      ? {
          url: `/clark/${record.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Clarkのケネス・アーノルド事件ページ共有画像",
        }
      : undefined;

  return {
    title,
    description: record.summary,
    alternates: {
      canonical: `/clark/${record.slug}`,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description: record.summary,
      url: `/clark/${record.slug}`,
      siteName: siteConfig.shortName,
      locale: "ja_JP",
      type: "article",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: record.summary,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function ClarkCaseRoute({ params }: ClarkCaseRouteProps) {
  const { slug } = await Promise.resolve(params);
  const record = getClarkCase(slug);

  if (!record) {
    notFound();
  }

  const nextCase = getClarkCase(record.nextCaseSlug);

  if (!nextCase) {
    notFound();
  }

  return <ClarkCasePage nextCase={nextCase} record={record} />;
}
